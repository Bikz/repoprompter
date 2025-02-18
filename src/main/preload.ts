import { contextBridge, ipcRenderer } from 'electron'
import { type FileSystemApi } from '../common/types'

// Explicitly type the API
const api: FileSystemApi = {
  sayHello: () => {
    console.log('Hello from preload!')
  },

  selectDirectory: async () => {
    return ipcRenderer.invoke('dialog:selectDirectory')
  },

  readDirectory: async (dirPath: string) => {
    try {
      return await ipcRenderer.invoke('fs:readDirectory', dirPath)
    } catch (error) {
      console.error('Failed to read directory:', error)
      throw error
    }
  },

  readFileContents: async (baseDir: string, relativeFilePath: string) => {
    try {
      return await ipcRenderer.invoke('fs:readFile', { baseDir, relativeFilePath })
    } catch (error) {
      console.error('Failed to read file:', error)
      throw error
    }
  },

  applyXmlDiff: async (basePath: string, xmlString: string) => {
    try {
      return await ipcRenderer.invoke('fs:applyXmlDiff', { basePath, xmlString })
    } catch (error) {
      console.error('Failed to apply XML diff:', error)
      return { success: false, error: String(error) }
    }
  }
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('api', api)