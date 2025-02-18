import { contextBridge, ipcRenderer } from 'electron'
import fs from 'fs'
import path from 'path'

// Type declarations for window.api
declare global {
  interface Window {
    api: {
      sayHello: () => void
      selectDirectory: () => Promise<string | undefined>
      readDirectory: (dirPath: string) => Promise<string[]>
      readFileContents: (baseDir: string, relativeFilePath: string) => Promise<string>
      applyXmlDiff: (basePath: string, xmlString: string) => Promise<{ success: boolean; error?: string }>
    }
  }
}

// Helper function to safely read directory
async function readDirRecursive(dirPath: string): Promise<string[]> {
  const results: string[] = []
  
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      
      if (entry.isDirectory()) {
        const subDirFiles = await readDirRecursive(fullPath)
        results.push(...subDirFiles)
      } else {
        results.push(path.relative(dirPath, fullPath))
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error)
    throw error
  }
  
  return results
}

// Expose APIs to renderer
contextBridge.exposeInMainWorld('api', {
  sayHello: () => {
    console.log('Hello from preload!')
  },

  selectDirectory: async () => {
    return ipcRenderer.invoke('dialog:selectDirectory')
  },

  readDirectory: async (dirPath: string) => {
    try {
      return await readDirRecursive(dirPath)
    } catch (error) {
      console.error('Failed to read directory:', error)
      throw error
    }
  },

  readFileContents: async (baseDir: string, relativeFilePath: string) => {
    try {
      const fullPath = path.join(baseDir, relativeFilePath)
      return await fs.promises.readFile(fullPath, 'utf-8')
    } catch (error) {
      console.error('Failed to read file:', error)
      throw error
    }
  },

  applyXmlDiff: async (basePath: string, xmlString: string) => {
    try {
      return await ipcRenderer.invoke('apply-xml-diff', { basePath, xmlString })
    } catch (error) {
      console.error('Failed to apply XML diff:', error)
      return { success: false, error: String(error) }
    }
  },
})