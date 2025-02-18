import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import path from 'path'
import { getAllFilePaths, readFileContent } from '../common/fileSystem'
import { applyDiffPatches } from '../common/diffParser'

let mainWindow: BrowserWindow | null = null

function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js')
    },
  })

  // Debug information
  console.log('Environment:', process.env.NODE_ENV)
  console.log('VITE_DEV_SERVER_URL:', process.env.VITE_DEV_SERVER_URL)
  
  // Load the app
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

  // Debug event
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
  })

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window finished loading')
  })
}

// IPC Handlers
function setupIpcHandlers() {
  ipcMain.handle('dialog:selectDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.canceled ? undefined : result.filePaths[0]
  })

  ipcMain.handle('fs:readDirectory', async (_, dirPath: string) => {
    try {
      return getAllFilePaths(dirPath)
    } catch (error) {
      console.error('Error reading directory:', error)
      throw error
    }
  })

  ipcMain.handle('fs:readFile', async (_, { baseDir, relativeFilePath }) => {
    try {
      return readFileContent(baseDir, relativeFilePath)
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

// App event handlers
app.whenReady().then(() => {
  console.log('App is ready')
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

// Handle app activation
app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow()
  }
})