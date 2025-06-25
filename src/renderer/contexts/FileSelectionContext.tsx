import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface FileSelectionContextType {
  baseDir: string
  setBaseDir: (dir: string) => Promise<void>
  fileList: string[]
  setFileList: (files: string[]) => void
  selectedFiles: string[]
  toggleSelectedFile: (file: string) => void
  setSelectedFiles: (files: string[]) => void
  clearSelection: () => void
}

const FileSelectionContext = createContext<FileSelectionContextType | undefined>(undefined)

interface FileSelectionProviderProps {
  children: ReactNode
}

export function FileSelectionProvider({ children }: FileSelectionProviderProps) {
  const [baseDir, setBaseDirState] = useState('')
  const [fileList, setFileListState] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  const setBaseDir = useCallback(async (dir: string) => {
    setBaseDirState(dir)
    try {
      const files = await window.api.readDirectory(dir)
      setFileList(files)
    } catch (error) {
      console.error('Error reading directory:', error)
    }
  }, [])

  const setFileList = useCallback((files: string[] | undefined | null) => {
    setFileListState(Array.isArray(files) ? files : [])
  }, [])

  const toggleSelectedFile = useCallback((file: string) => {
    setSelectedFiles(prev =>
      prev.includes(file) ? prev.filter(f => f !== file) : [...prev, file]
    )
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedFiles([])
  }, [])

  const contextValue: FileSelectionContextType = {
    baseDir,
    setBaseDir,
    fileList,
    setFileList,
    selectedFiles,
    toggleSelectedFile,
    setSelectedFiles,
    clearSelection
  }

  return (
    <FileSelectionContext.Provider value={contextValue}>
      {children}
    </FileSelectionContext.Provider>
  )
}

export function useFileSelection(): FileSelectionContextType {
  const context = useContext(FileSelectionContext)
  if (!context) {
    throw new Error('useFileSelection must be used within a FileSelectionProvider')
  }
  return context
}