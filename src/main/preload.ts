/**
 * Preload script
 * Exposes safe APIs for directory selection, reading/writing files, and diff application
 */

import { contextBridge, ipcRenderer } from 'electron'
import fs from 'fs'
import path from 'path'

contextBridge.exposeInMainWorld('api', {
  // Basic test
  sayHello: () => {
    console.log('Hello from preload!')
  },

  // Show directory picker dialog
  selectDirectory: async (): Promise<string | undefined> => {
    return ipcRenderer.invoke('dialog:selectDirectory')
  },

  // Recursively read directory structure
  // Returns an array of file paths relative to the chosen directory
  readDirectory: (dirPath: string): string[] => {
    const results: string[] = []

    function readDirRecursive(currentPath: string) {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true })
      for (const entry of entries) {
        const entryPath = path.join(currentPath, entry.name)
        if (entry.isDirectory()) {
          readDirRecursive(entryPath)
        } else {
          results.push(path.relative(dirPath, entryPath))
        }
      }
    }

    readDirRecursive(dirPath)
    return results
  },

  // Read file contents (relative path from baseDir)
  readFileContents: (baseDir: string, relativeFilePath: string): string => {
    const fullPath = path.join(baseDir, relativeFilePath)
    return fs.readFileSync(fullPath, 'utf-8')
  },

  // Apply diffs (XML string) to local files
  applyXmlDiff: async (basePath: string, xmlString: string) => {
    return ipcRenderer.invoke('apply-xml-diff', { basePath, xmlString })
  },
})