/**
 * useRepoContext.tsx
 * Provides a shared React context for storing selected directory, file list, and selected files.
 */

import React, { createContext, useContext, useState } from 'react'

interface RepoContextType {
  baseDir: string
  setBaseDir: (dir: string) => void
  fileList: string[]
  setFileList: (files: string[]) => void
  selectedFiles: string[]
  toggleSelectedFile: (file: string) => void
}

const RepoContext = createContext<RepoContextType>({} as RepoContextType)

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const [baseDir, setBaseDir] = useState('')
  const [fileList, setFileList] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  function toggleSelectedFile(file: string) {
    setSelectedFiles(prev => {
      if (prev.includes(file)) {
        return prev.filter(f => f !== file)
      }
      return [...prev, file]
    })
  }

  const value = {
    baseDir,
    setBaseDir,
    fileList,
    setFileList,
    selectedFiles,
    toggleSelectedFile,
  }

  return (
    <RepoContext.Provider value={value}>
      {children}
    </RepoContext.Provider>
  )
}

export function useRepoContext() {
  return useContext(RepoContext)
}