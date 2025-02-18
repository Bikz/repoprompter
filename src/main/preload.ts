import { contextBridge, ipcRenderer } from 'electron'
import type { FileSystemApi } from '../common/types'

const api: FileSystemApi = {
  sayHello: () => {
    console.log('Hello from preload!')
  },

  selectDirectory: async () => {
    console.log('Selecting directory...')
    const result = await ipcRenderer.invoke('dialog:selectDirectory')
    console.log('Selected directory:', result)
    return result
  },

  readDirectory: async (dirPath: string) => {
    console.log('Reading directory in preload:', dirPath)
    try {
      const files = await ipcRenderer.invoke('fs:readDirectory', dirPath)
      console.log('Files found:', files)
      return files
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

contextBridge.exposeInMainWorld('api', api)