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
        // Skip hidden files and certain directories
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

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js')
    },
  })

  if (process.env.NODE_ENV === 'development') {
    const devServerUrl = process.env.VITE_DEV_SERVER_URL
    if (!devServerUrl) {
      throw new Error('VITE_DEV_SERVER_URL is not defined')
    }
    mainWindow.loadURL(devServerUrl)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

function setupIpcHandlers() {
  // Select directory handler
  ipcMain.handle('dialog:selectDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.canceled ? undefined : result.filePaths[0]
  })

  // Read directory handler - now with proper error handling
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

  // Read file handler
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

  // Apply XML diff handler
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

app.whenReady().then(() => {
  createMainWindow()
  setupIpcHandlers()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})