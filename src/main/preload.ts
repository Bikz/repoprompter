import { contextBridge, ipcRenderer } from 'electron'
import type { FileSystemApi } from '../common/types'

// Validate that the API methods exist before exposing them
const api: FileSystemApi = {
  sayHello: () => {
    console.log('Hello from preload!')
  },

  selectDirectory: async () => {
    try {
      return await ipcRenderer.invoke('dialog:selectDirectory')
    } catch (error) {
      console.error('Failed to select directory:', error)
      throw error
    }
  },

  readDirectory: async (dirPath: string) => {
    if (!dirPath) {
      throw new Error('Directory path is required')
    }
    try {
      return await ipcRenderer.invoke('fs:readDirectory', dirPath)
    } catch (error) {
      console.error('Failed to read directory:', error)
      throw error
    }
  },

  readFileContents: async (baseDir: string, relativeFilePath: string) => {
    if (!baseDir || !relativeFilePath) {
      throw new Error('Base directory and relative file path are required')
    }
    try {
      return await ipcRenderer.invoke('fs:readFile', { baseDir, relativeFilePath })
    } catch (error) {
      console.error('Failed to read file:', error)
      throw error
    }
  },

  applyXmlDiff: async (basePath: string, xmlString: string) => {
    if (!basePath || !xmlString) {
      throw new Error('Base path and XML string are required')
    }
    try {
      return await ipcRenderer.invoke('fs:applyXmlDiff', { basePath, xmlString })
    } catch (error) {
      console.error('Failed to apply XML diff:', error)
      return { success: false, error: String(error) }
    }
  }
}

// Type-safe exposure of the API
contextBridge.exposeInMainWorld('api', api)

// Handle any errors that occur during preload
window.addEventListener('error', (event) => {
  console.error('Preload script error:', event.error)
})