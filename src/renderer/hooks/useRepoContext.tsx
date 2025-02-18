/**
 * useRepoContext.ts
 * Manages global state for:
 *   - baseDir, fileList, selectedFiles
 *   - diffChanges (parsed from AI's XML)
 *   - Accept/Reject diff methods
 */

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { parseDiffXml } from '../../common/diffParser'

interface FileChange {
  fileName: string
  newContent: string
}

interface RepoContextType {
  baseDir: string
  setBaseDir: (dir: string) => void
  fileList: string[]
  setFileList: (files: string[]) => void
  selectedFiles: string[]
  toggleSelectedFile: (file: string) => void

  diffChanges: FileChange[]
  setDiffXmlAndParse: (xmlString: string) => void
  applyFullDiff: (xmlString: string) => Promise<void>
  acceptAllDiffs: () => Promise<void>
  acceptSingleDiff: (fileName: string, newContent: string) => Promise<void>
  rejectSingleDiff: (fileName: string) => void
}

const RepoContext = createContext<RepoContextType | undefined>(undefined)

interface RepoProviderProps {
  children: ReactNode
}

export function RepoProvider({ children }: RepoProviderProps) {
  const [baseDir, setBaseDir] = useState('')
  const [fileList, setFileList] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [diffChanges, setDiffChanges] = useState<FileChange[]>([])

  // Toggle file selection
  const toggleSelectedFile = React.useCallback((file: string) => {
    setSelectedFiles(prev =>
      prev.includes(file)
        ? prev.filter(f => f !== file)
        : [...prev, file]
    )
  }, [])

  // Helper to ensure fileList is always an array
  const safeSetFileList = (files: string[] | undefined | null) => {
    setFileList(Array.isArray(files) ? files : [])
  }

  // Parse XML string, store as "pending changes"
  const setDiffXmlAndParse = (xmlString: string) => {
    const changes = parseDiffXml(xmlString)
    setDiffChanges(changes)
  }

  // Apply the entire XML diff at once
  const applyFullDiff = async (xmlString: string) => {
    try {
      const res = await window.api.applyXmlDiff(baseDir, xmlString)
      if (!res.success) {
        alert(`Failed to apply diff: ${res.error}`)
      } else {
        alert('Diff applied successfully!')
        setDiffChanges([])
      }
    } catch (error) {
      alert(`Error applying diff: ${error}`)
    }
  }

  // Accept all currently staged diffs
  // (calls applyFullDiff with an XML string that lumps them together,
  // or calls the existing method if you prefer the original approach).
  const acceptAllDiffs = async () => {
    if (diffChanges.length === 0) return
    // Rebuild a simple XML from diffChanges so we can apply them at once.
    let xmlString = '<root>\n'
    diffChanges.forEach(ch => {
      xmlString += `  <file name="${ch.fileName}">\n`
      xmlString += `    <replace><![CDATA[${ch.newContent}]]></replace>\n`
      xmlString += '  </file>\n'
    })
    xmlString += '</root>'
    await applyFullDiff(xmlString)
  }

  // Accept a single file's change and remove it from the array
  const acceptSingleDiff = async (fileName: string, newContent: string) => {
    try {
      // Rebuild an XML that only includes this single file
      let xmlString = '<root>\n'
      xmlString += `  <file name="${fileName}">\n`
      xmlString += `    <replace><![CDATA[${newContent}]]></replace>\n`
      xmlString += '  </file>\n'
      xmlString += '</root>'

      const res = await window.api.applyXmlDiff(baseDir, xmlString)
      if (!res.success) {
        alert(`Failed to apply diff for ${fileName}: ${res.error}`)
        return
      }
      // Remove the accepted file from local diffChanges
      setDiffChanges(prev => prev.filter(fc => fc.fileName !== fileName))
      alert(`Changes for ${fileName} accepted and applied!`)
    } catch (err) {
      alert(`Error applying diff for ${fileName}: ${String(err)}`)
    }
  }

  // Reject a single file's change (do nothing on disk)
  const rejectSingleDiff = (fileName: string) => {
    setDiffChanges(prev => prev.filter(fc => fc.fileName !== fileName))
  }

  const contextValue: RepoContextType = {
    baseDir,
    setBaseDir,
    fileList,
    setFileList: safeSetFileList,
    selectedFiles,
    toggleSelectedFile,

    diffChanges,
    setDiffXmlAndParse,
    applyFullDiff,
    acceptAllDiffs,
    acceptSingleDiff,
    rejectSingleDiff,
  }

  return (
    <RepoContext.Provider value={contextValue}>
      {children}
    </RepoContext.Provider>
  )
}

export function useRepoContext(): RepoContextType {
  const context = useContext(RepoContext)
  if (!context) {
    throw new Error('useRepoContext must be used within a RepoProvider')
  }
  return context
}