import React, { createContext, useContext, useCallback, ReactNode } from 'react'
import { useFileSelection } from './FileSelectionContext'

interface FileUtilsContextType {
  unselectUnnecessaryFiles: () => Promise<void>
}

const FileUtilsContext = createContext<FileUtilsContextType | undefined>(undefined)

interface FileUtilsProviderProps {
  children: ReactNode
}

export function FileUtilsProvider({ children }: FileUtilsProviderProps) {
  const { selectedFiles, setSelectedFiles, baseDir } = useFileSelection()

  const unselectUnnecessaryFiles = useCallback(async () => {
    if (!baseDir) return

    try {
      const { ignorePatterns } = await window.api.getIgnorePatterns()
      
      const isUnnecessary = (filePath: string): boolean => {
        return ignorePatterns.some(pattern => {
          if (typeof pattern === 'string') {
            return filePath.endsWith(pattern) || filePath.includes(`/${pattern}`) || filePath === pattern
          } else {
            const regex = new RegExp(pattern.pattern, pattern.flags || '')
            return regex.test(filePath)
          }
        })
      }
      
      const necessaryFiles = selectedFiles.filter(file => !isUnnecessary(file))
      const removedCount = selectedFiles.length - necessaryFiles.length
      
      setSelectedFiles(necessaryFiles)
      
      if (removedCount > 0) {
        alert(`Removed ${removedCount} unnecessary files from selection. Kept ${necessaryFiles.length} core files for AI context.`)
      } else {
        alert('No unnecessary files found in current selection.')
      }
    } catch (error) {
      console.error('Error filtering files:', error)
      alert('Failed to filter unnecessary files')
    }
  }, [selectedFiles, setSelectedFiles, baseDir])

  const contextValue: FileUtilsContextType = {
    unselectUnnecessaryFiles
  }

  return (
    <FileUtilsContext.Provider value={contextValue}>
      {children}
    </FileUtilsContext.Provider>
  )
}

export function useFileUtils(): FileUtilsContextType {
  const context = useContext(FileUtilsContext)
  if (!context) {
    throw new Error('useFileUtils must be used within a FileUtilsProvider')
  }
  return context
}