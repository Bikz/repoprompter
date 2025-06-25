/**
 * File: preload.ts
 * Description: Exposes a safe FileSystemApi to the renderer via contextBridge.
 * Defines methods for reading directories, files, parsing XML diffs, etc.
 */

import { contextBridge, ipcRenderer } from 'electron'
import type {
  FileSystemApi,
  FileChange,
  LoadRepoSettingsResponse,
  UpdateRepoSettingsResponse,
  KnownLargeFilesResponse,
  IgnorePatternsResponse,
  RepoSettings
} from '../common/types'

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

  parseXmlDiff: async (xmlString: string) => {
    if (!xmlString) {
      return []
    }
    try {
      const res = await ipcRenderer.invoke('fs:parseXmlDiff', xmlString)
      if (!res.success) {
        throw new Error(res.error || 'Failed to parse XML diff.')
      }
      return res.changes as FileChange[]
    } catch (error) {
      console.error('Failed to parse XML diff:', error)
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
  },

  /** Batch read multiple files at once. */
  readMultipleFileContents: async (baseDir: string, files: string[]) => {
    if (!baseDir || !files?.length) {
      return { contents: {}, errors: [] }
    }
    try {
      return await ipcRenderer.invoke('fs:readMultipleFiles', { baseDir, files })
    } catch (error) {
      console.error('Failed to read multiple files:', error)
      throw error
    }
  },

  /**
   * Config-related methods for loading/updating repo settings or known large files.
   */
  loadRepoSettings: async (repoPath) => {
    try {
      return await ipcRenderer.invoke('config:loadRepoSettings', repoPath) as LoadRepoSettingsResponse
    } catch (error) {
      console.error('Failed to load repo settings:', error)
      return { success: false, error: String(error) }
    }
  },

  updateRepoSettings: async (repoPath, updates) => {
    try {
      return await ipcRenderer.invoke('config:updateRepoSettings', { repoPath, updates }) as UpdateRepoSettingsResponse
    } catch (error) {
      console.error('Failed to update repo settings:', error)
      return { success: false, error: String(error) }
    }
  },

  getKnownLargeFiles: async () => {
    try {
      return await ipcRenderer.invoke('config:getKnownLargeFiles') as KnownLargeFilesResponse
    } catch (error) {
      console.error('Failed to get known large files:', error)
      return { success: false, error: String(error) }
    }
  },

  setKnownLargeFiles: async (newList) => {
    try {
      return await ipcRenderer.invoke('config:setKnownLargeFiles', newList) as KnownLargeFilesResponse
    } catch (error) {
      console.error('Failed to set known large files:', error)
      return { success: false, error: String(error) }
    }
  },

  getIgnorePatterns: async () => {
    try {
      return await ipcRenderer.invoke('config:getIgnorePatterns') as IgnorePatternsResponse
    } catch (error) {
      console.error('Failed to get ignore patterns:', error)
      return { success: false, error: String(error) }
    }
  },

  setIgnorePatterns: async (newList) => {
    try {
      return await ipcRenderer.invoke('config:setIgnorePatterns', newList) as IgnorePatternsResponse
    } catch (error) {
      console.error('Failed to set ignore patterns:', error)
      return { success: false, error: String(error) }
    }
  }
}

contextBridge.exposeInMainWorld('api', api)

window.addEventListener('error', (event) => {
  console.error('Preload script error:', event.error)
})