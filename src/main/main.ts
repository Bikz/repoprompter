import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron'
import path from 'path'
import fs from 'fs'
import { parseDiffXml, applyDiffPatches } from '../common/diffParser'
import {
  getRepoSettings,
  updateRepoSettings,
  getKnownLargeFiles,
  setKnownLargeFiles,
  isFileIgnored,
  getIgnorePatterns
} from './configStore'
import { autoUpdater } from 'electron-updater'
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'

let mainWindow: BrowserWindow | null = null

// Debug configuration for remote debugging
interface DebugConfig {
  enabled: boolean
  port: number
  host: string
}

const debugConfig: DebugConfig = {
  enabled: process.env.NODE_ENV === 'development',
  port: parseInt(process.env.REMOTE_DEBUGGING_PORT || '9222'),
  host: 'localhost'
}

function createAppMenu() {
  const template = [
    {
      label: 'File',
      submenu: [{ role: 'quit' }]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template as any)
  Menu.setApplicationMenu(menu)
}

async function readDirRecursive(dirPath: string): Promise<string[]> {
  const files: string[] = []

  async function traverse(currentPath: string) {
    const entries = await fs.promises.readdir(currentPath, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name)
      const relativePath = path.relative(dirPath, fullPath)
      
      // Check if file/directory should be ignored
      if (isFileIgnored(relativePath)) {
        continue
      }
      
      if (entry.isDirectory()) {
        // Also check if the directory itself should be ignored
        const dirRelativePath = relativePath + '/'
        if (!isFileIgnored(dirRelativePath)) {
          await traverse(fullPath)
        }
      } else {
        files.push(relativePath)
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
    show: false,
    titleBarStyle: 'hiddenInset',
    // Provide a normal background and enable mac's slight corner rounding
    backgroundColor: '#FFFFFF',
    roundedCorners: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js'),
      spellcheck: false
    }
  })

  const devServerUrl = process.env.VITE_DEV_SERVER_URL

  if (process.env.NODE_ENV === 'development' && devServerUrl) {
    try {
      console.log(`Attempting to load URL: ${devServerUrl}`)
      await mainWindow.loadURL(devServerUrl)
      mainWindow.webContents.openDevTools()
      mainWindow.show()
    } catch (error) {
      console.error('Failed to load dev server URL:', devServerUrl, error)
      dialog.showErrorBox(
        'Dev Server Load Error',
        `Cannot load dev server at ${devServerUrl}\n${error}`
      )
    }
  } else {
    const indexPath = path.join(__dirname, '..', 'renderer', 'index.html')
    await mainWindow.loadFile(indexPath)
    mainWindow.show()
  }

  mainWindow.once('ready-to-show', () => {
    console.log('Window is ready to show')
    mainWindow?.show()
    mainWindow?.focus()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  setupAutoUpdater()
}

function setupIpcHandlers() {
  ipcMain.handle('dialog:selectDirectory', async () => {
    if (!mainWindow) return undefined
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    return result.canceled ? undefined : result.filePaths[0]
  })

  ipcMain.handle('fs:readDirectory', async (_, dirPath: string) => {
    return readDirRecursive(dirPath)
  })

  ipcMain.handle('fs:readFile', async (_, { baseDir, relativeFilePath }) => {
    const fullPath = path.join(baseDir, relativeFilePath)
    try {
      const stats = await fs.promises.stat(fullPath)
      const fileSizeInMB = stats.size / (1024 * 1024)
      
      if (fileSizeInMB > 5) {
        throw new Error(`File ${relativeFilePath} is too large (${fileSizeInMB.toFixed(1)} MB). Files over 5MB are not supported.`)
      }
      
      return fs.promises.readFile(fullPath, 'utf-8')
    } catch (error) {
      if (error instanceof Error && error.message.includes('too large')) {
        throw error
      }
      throw new Error(`Failed to read file ${relativeFilePath}: ${error}`)
    }
  })

  ipcMain.handle('fs:readMultipleFiles', async (_, { baseDir, files }) => {
    const contents: Record<string, string> = {}
    const errors: string[] = []
    
    await Promise.all(
      files.map(async (file: string) => {
        try {
          const fullPath = path.join(baseDir, file)
          const stats = await fs.promises.stat(fullPath)
          const fileSizeInMB = stats.size / (1024 * 1024)
          
          if (fileSizeInMB > 5) {
            errors.push(`${file} (${fileSizeInMB.toFixed(1)} MB - too large)`)
            contents[file] = `// File too large (${fileSizeInMB.toFixed(1)} MB) - content not loaded`
            return
          }
          
          const data = await fs.promises.readFile(fullPath, 'utf-8')
          contents[file] = data
        } catch (err) {
          console.error(`Failed to read file '${file}':`, err)
          contents[file] = `// Error reading file: ${err}`
        }
      })
    )
    
    return { contents, errors }
  })

  ipcMain.handle('fs:parseXmlDiff', (_, xmlString: string) => ({
    success: true,
    changes: parseDiffXml(xmlString)
  }))

  ipcMain.handle('fs:applyXmlDiff', async (_, { basePath, xmlString }) => {
    try {
      await applyDiffPatches(basePath, xmlString)
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('config:loadRepoSettings', (_, repoPath: string) => ({
    success: true,
    settings: getRepoSettings(repoPath)
  }))

  ipcMain.handle('config:updateRepoSettings', (_, { repoPath, updates }) => {
    updateRepoSettings(repoPath, updates)
    return { success: true }
  })

  ipcMain.handle('config:getKnownLargeFiles', () => ({
    success: true,
    list: getKnownLargeFiles()
  }))

  ipcMain.handle('config:setKnownLargeFiles', (_, newList: string[]) => {
    setKnownLargeFiles(newList)
    return { success: true }
  })
  
  ipcMain.handle('config:getIgnorePatterns', () => ({
    success: true,
    ignorePatterns: getIgnorePatterns()
  }))
}

function setupAutoUpdater() {
  autoUpdater.checkForUpdatesAndNotify()
}

// Configure remote debugging if enabled
function configureRemoteDebugging() {
  if (debugConfig.enabled) {
    console.log(`Enabling remote debugging on ${debugConfig.host}:${debugConfig.port}`)
    app.commandLine.appendSwitch('remote-debugging-port', debugConfig.port.toString())
    app.commandLine.appendSwitch('remote-debugging-address', debugConfig.host)
  }
}

// Configure remote debugging before app is ready
configureRemoteDebugging()

app.whenReady().then(async () => {
  // Install React Developer Tools in development
  if (process.env.NODE_ENV === 'development') {
    try {
      const name = await installExtension(REACT_DEVELOPER_TOOLS)
      console.log(`Added Extension: ${name}`)
    } catch (err) {
      console.log('An error occurred installing React DevTools: ', err)
    }
  }
  
  createAppMenu()
  await createMainWindow()
  setupIpcHandlers()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) await createMainWindow()
})