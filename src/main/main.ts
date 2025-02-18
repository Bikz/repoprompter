import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import { getAllFilePaths, readFileContent } from '../common/fileSystem'
import { applyDiffPatches } from '../common/diffParser'

let mainWindow: BrowserWindow | null = null

async function readDirRecursive(dirPath: string): Promise<string[]> {
  const files: string[] = []
  
  async function traverse(currentPath: string) {
    const entries = await fs.promises.readdir(currentPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name)
      const relativePath = path.relative(dirPath, fullPath)
      
      if (entry.isDirectory()) {
        await traverse(fullPath)
      } else {
        if (!entry.name.startsWith('.') &&
            !relativePath.includes('node_modules') &&
            !relativePath.includes('.git')) {
          files.push(relativePath)
        }
      }
    }
  }
  
  await traverse(dirPath)
  return files
}

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: false,
    },
    backgroundColor: '#ffffff',
    show: false,
    titleBarStyle: 'hiddenInset',
  })

  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 5173
    const url = `http://localhost:${port}`
    
    try {
      await mainWindow.loadURL(url)
      mainWindow.webContents.openDevTools()
    } catch (error) {
      console.error('Failed to connect to dev server:', error)
      dialog.showErrorBox(
        'Development Server Error',
        `Could not connect to development server at ${url}. Please ensure the dev server is running.`
      )
      app.quit()
    }
  } else {
    const indexPath = path.join(__dirname, '..', 'renderer', 'index.html')
    if (!fs.existsSync(indexPath)) {
      dialog.showErrorBox('File Error', `Could not find index.html at ${indexPath}`)
      app.quit()
      return
    }
    await mainWindow.loadFile(indexPath)
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function setupIpcHandlers() {
  ipcMain.handle('dialog:selectDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.canceled ? undefined : result.filePaths[0]
  })

  ipcMain.handle('fs:readDirectory', async (_, dirPath: string) => {
    try {
      console.log('Reading directory:', dirPath)
      const files = await readDirRecursive(dirPath)
      console.log('Found files:', files.length)
      return files
    } catch (error) {
      console.error('Error reading directory:', error)
      throw error
    }
  })

  ipcMain.handle('fs:readFile', async (_, { baseDir, relativeFilePath }) => {
    try {
      const fullPath = path.join(baseDir, relativeFilePath)
      const content = await fs.promises.readFile(fullPath, 'utf-8')
      return content
    } catch (error) {
      console.error('Error reading file:', error)
      throw error
    }
  })

  ipcMain.handle('fs:applyXmlDiff', async (_, { basePath, xmlString }) => {
    try {
      await applyDiffPatches(basePath, xmlString)
      return { success: true }
    } catch (error) {
      console.error('Error applying XML diff:', error)
      return { success: false, error: String(error) }
    }
  })
}

// Minimal app configuration
if (process.platform === 'darwin') {
  app.commandLine.appendSwitch('disable-features', 'UseSpellCheck')
}

app.whenReady().then(async () => {
  await createMainWindow()
  setupIpcHandlers()

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
  dialog.showErrorBox(
    'Application Error',
    `An unexpected error occurred: ${error.message}`
  )
})