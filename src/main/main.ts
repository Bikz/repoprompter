import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron'
import path from 'path'
import fs from 'fs'
import { parseDiffXml, applyDiffPatches } from '../common/diffParser'
import {
  getRepoSettings,
  updateRepoSettings,
  getKnownLargeFiles,
  setKnownLargeFiles
} from './configStore'
import { autoUpdater } from 'electron-updater'

let mainWindow: BrowserWindow | null = null

function createAppMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
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
      if (entry.isDirectory()) {
        await traverse(fullPath)
      } else {
        if (
          !entry.name.startsWith('.') &&
          !relativePath.includes('node_modules') &&
          !relativePath.includes('.git')
        ) {
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
    show: false,
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
      await mainWindow.loadURL(devServerUrl)
      mainWindow.webContents.openDevTools()
    } catch (error) {
      console.error('Failed to load dev server URL:', devServerUrl, error)
      dialog.showErrorBox('Dev Server Load Error', `Cannot load dev server at ${devServerUrl}\n${error}`)
    }
  } else {
    const indexPath = path.join(__dirname, '..', 'renderer', 'index.html')
    await mainWindow.loadFile(indexPath)
  }

  mainWindow.once('ready-to-show', () => {
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
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] })
    return result.canceled ? undefined : result.filePaths[0]
  })

  ipcMain.handle('fs:readDirectory', async (_, dirPath: string) => {
    return readDirRecursive(dirPath)
  })

  ipcMain.handle('fs:readFile', async (_, { baseDir, relativeFilePath }) => {
    return fs.promises.readFile(path.join(baseDir, relativeFilePath), 'utf-8')
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
}

function setupAutoUpdater() {
  autoUpdater.checkForUpdatesAndNotify()
}

app.whenReady().then(async () => {
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