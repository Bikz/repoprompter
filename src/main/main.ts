/**
 * Main entry point of Electron app
 * Creates BrowserWindow and sets up IPC handlers for reading/applying diffs
 */

import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import { applyDiffPatches } from '@/common/diffParser'

let mainWindow: BrowserWindow | null = null

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js'),
    },
  })

  // In development, use the Vite dev server URL
  if (process.env.VITE_DEV_SERVER_URL) {
    console.log('Loading dev server:', process.env.VITE_DEV_SERVER_URL)
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    const indexPath = path.resolve(__dirname, '../../dist/renderer/index.html')
    console.log('Loading production build:', indexPath)
    mainWindow
      .loadFile(indexPath)
      .catch(err => {
        console.error('Failed to load renderer:', err)
        console.log('Current directory:', __dirname)
        console.log('Attempted path:', indexPath)
      })
  }

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }
}

/**
 * IPC Handlers
 */
function setupIpcHandlers() {
  // Ask user to pick a directory. Returns string path or undefined
  ipcMain.handle('dialog:selectDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    if (result.canceled || result.filePaths.length === 0) {
      return undefined
    }
    return result.filePaths[0]
  })

  // Apply diffs (in XML form) to local files
  // The renderer sends { basePath, xmlString }
  ipcMain.handle('apply-xml-diff', async (event, { basePath, xmlString }) => {
    try {
      await applyDiffPatches(basePath, xmlString)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}

// Handle app ready
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