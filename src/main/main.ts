/**
 * File: main.ts
 * Description: Electron main process entry. Creates the BrowserWindow and IPC handlers.
 * Manages reading directory structures, parsing diffs, applying diffs, and config.
 */

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

// Function to create application menu with File > New Window option
function createAppMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: async () => {
            console.log('Creating new window from menu...')
            await createMainWindow()
          }
        },
        { type: 'separator' },
        {
          label: 'Test Window',
          click: async () => {
            console.log('Creating test window...')
            const testWindow = new BrowserWindow({ 
              width: 800, 
              height: 600,
              show: true,
              webPreferences: {
                contextIsolation: true
              }
            })
            testWindow.loadURL('data:text/html,<html><body><h1>Test Window</h1><p>If you can see this, Electron windows are working!</p></body></html>')
            testWindow.show()
          }
        },
        { type: 'separator' },
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
  try {
    console.log('Creating browser window...')
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js'),
        spellcheck: false
      }
    })

    console.log('Browser window created, loading content...')
    console.log('__dirname:', __dirname)

    // Check if preload script exists
    const preloadPath = path.join(__dirname, 'preload.js')
    console.log('Preload script path:', preloadPath)
    console.log('Preload script exists:', fs.existsSync(preloadPath))

    if (process.env.NODE_ENV === 'development') {
      const port = process.env.PORT || 5173
      const url = `http://localhost:${port}`
      
      // Add retry mechanism for dev server
      let retries = 0
      const maxRetries = 5
      const retryInterval = 1000 // 1 second
      
      const loadDevServer = async () => {
        try {
          console.log(`Attempting to connect to dev server at ${url} (attempt ${retries + 1}/${maxRetries})`)
          await mainWindow?.loadURL(url)
          console.log('Successfully connected to dev server')
          mainWindow?.webContents.openDevTools()
          return true
        } catch (error) {
          console.error(`Failed to connect to dev server (attempt ${retries + 1}/${maxRetries}):`, error)
          retries++
          if (retries < maxRetries) {
            console.log(`Retrying in ${retryInterval}ms...`)
            await new Promise(resolve => setTimeout(resolve, retryInterval))
            return loadDevServer()
          } else {
            console.error('Max retries reached, giving up')
            dialog.showErrorBox(
              'Development Server Error',
              `Could not connect to development server at ${url} after ${maxRetries} attempts. Please ensure the dev server is running.`
            )
            return false
          }
        }
      }
      
      const success = await loadDevServer()
      if (!success) {
        app.quit()
        return
      }
    } else {
      const indexPath = path.join(__dirname, '..', 'renderer', 'index.html')
      console.log('Looking for index.html at:', indexPath)
      console.log('File exists:', fs.existsSync(indexPath))
      
      if (!fs.existsSync(indexPath)) {
        dialog.showErrorBox('File Error', `Could not find index.html at ${indexPath}`)
        app.quit()
        return
      }

      try {
        await mainWindow.loadFile(indexPath)
        console.log('Index file loaded successfully')
      } catch (error) {
        console.error('Error loading index file:', error)
        dialog.showErrorBox(
          'Loading Error',
          `Failed to load application UI: ${(error as Error).message}`
        )
      }
    }

    mainWindow.once('ready-to-show', () => {
      console.log('Window is ready to show')
      if (mainWindow) {
        mainWindow.show()
        console.log('Window show() called')
        mainWindow.focus()
        console.log('Window focus() called')
      } else {
        console.error('mainWindow is null in ready-to-show handler')
      }
    })

    // Setup auto-updater events once the window is created
    setupAutoUpdater()

    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
          ]
        }
      })
    })

    mainWindow.on('closed', () => {
      mainWindow = null
    })

    // Add these after window creation
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load:', errorCode, errorDescription)
      dialog.showErrorBox(
        'Loading Failed',
        `Failed to load content: ${errorDescription} (${errorCode})`
      )
    })

    mainWindow.webContents.on('render-process-gone', (event, details) => {
      console.error('Renderer process gone:', details.reason)
      dialog.showErrorBox(
        'Renderer Crashed',
        `The application window has crashed (${details.reason}). Please restart the application.`
      )
    })

    mainWindow.on('unresponsive', () => {
      console.error('Window became unresponsive')
      dialog.showErrorBox(
        'Window Unresponsive',
        'The application window is not responding. You may need to restart the application.'
      )
    })

    return mainWindow
  } catch (error) {
    console.error('Error creating main window:', error)
    dialog.showErrorBox(
      'Window Creation Error',
      `Failed to create application window: ${(error as Error).message}`
    )
    throw error
  }
}

/** Setup IPC handlers for directory selection, reading, diff parse, and config. */
function setupIpcHandlers() {
  ipcMain.handle('dialog:selectDirectory', async () => {
    if (!mainWindow) return undefined
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    return result.canceled ? undefined : result.filePaths[0]
  })

  ipcMain.handle('fs:readDirectory', async (_, dirPath: string) => {
    try {
      const files = await readDirRecursive(dirPath)
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

  ipcMain.handle('fs:parseXmlDiff', async (_, xmlString: string) => {
    try {
      const changes = parseDiffXml(xmlString)
      return { success: true, changes }
    } catch (error) {
      console.error('Error parsing XML diff:', error)
      return { success: false, error: String(error) }
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

  // Config-related
  ipcMain.handle('config:loadRepoSettings', async (_, repoPath: string) => {
    try {
      const settings = getRepoSettings(repoPath)
      return { success: true, settings }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('config:updateRepoSettings', async (_, { repoPath, updates }) => {
    try {
      updateRepoSettings(repoPath, updates)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('config:getKnownLargeFiles', async () => {
    try {
      const list = getKnownLargeFiles()
      return { success: true, list }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('config:setKnownLargeFiles', async (_, newList: string[]) => {
    try {
      setKnownLargeFiles(newList)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}

function setupAutoUpdater() {
  // Called at app start after mainWindow creation
  autoUpdater.on('update-available', () => {
    console.log('A new update is available. Downloading in background.')
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, {
        title: 'Update Available',
        message: 'A new version of RepoPrompter is available and will download in the background.'
      })
    }
  })

  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded, ready to install.')
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, {
        title: 'Install Update',
        message: 'Updates downloaded. The app will now restart to apply them.'
      }).then(() => {
        setImmediate(() => autoUpdater.quitAndInstall())
      })
    } else {
      autoUpdater.quitAndInstall()
    }
  })

  autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err)
  })

  // Immediately check for updates
  autoUpdater.checkForUpdatesAndNotify()
}

if (process.platform === 'darwin') {
  app.commandLine.appendSwitch('disable-features', 'UseSpellCheck,Autofill')
} else {
  app.commandLine.appendSwitch('disable-features', 'Autofill')
}

app.whenReady().then(async () => {
  console.log('App is ready, creating main window...')
  try {
    // Create application menu
    createAppMenu()
    
    await createMainWindow()
    console.log('Main window created successfully')
    setupIpcHandlers()
    console.log('IPC handlers set up')
  } catch (error) {
    console.error('Failed to initialize app:', error)
    dialog.showErrorBox(
      'Initialization Error',
      `Failed to start application: ${(error as Error).message}`
    )
  }

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
    `An unexpected error occurred: ${(error as Error).message}`
  )
})