import React, { createContext, useContext, useState, ReactNode } from 'react'
import type { FileChange } from '../../common/types'

interface GroupItem {
  name: string
  files: string[]
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

  // Groups
  groups: GroupItem[]
  createGroupFromSelection: () => void
  selectGroup: (name: string) => void
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

  // Groups array with name and associated files
  const [groups, setGroups] = useState<GroupItem[]>([])

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

  // Parse XML string in main process, store as "pending changes"
  const setDiffXmlAndParse = async (xmlString: string) => {
    if (!xmlString?.trim() || !window.api.parseXmlDiff) return
    try {
      const changes = await window.api.parseXmlDiff(xmlString)
      setDiffChanges(changes)
    } catch (err) {
      alert(`Failed to parse diff XML: ${String(err)}`)
    }
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
  const acceptAllDiffs = async () => {
    if (diffChanges.length === 0) return
    let xmlString = '<root>\n'
    diffChanges.forEach(ch => {
      xmlString += `  <file name="${ch.fileName}">\n`
      xmlString += `    <replace><![CDATA[${ch.newContent}]]></replace>\n`
      xmlString += '  </file>\n'
    })
    xmlString += '</root>'
    await applyFullDiff(xmlString)
  }

  // Accept a single file's change
  const acceptSingleDiff = async (fileName: string, newContent: string) => {
    try {
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
      // Remove from local state
      setDiffChanges(prev => prev.filter(fc => fc.fileName !== fileName))
      alert(`Changes for ${fileName} accepted and applied!`)
    } catch (err) {
      alert(`Error applying diff for ${fileName}: ${String(err)}`)
    }
  }

  // Reject a single file's change
  const rejectSingleDiff = (fileName: string) => {
    setDiffChanges(prev => prev.filter(fc => fc.fileName !== fileName))
  }

  // Create a new group from the current selection
  const createGroupFromSelection = () => {
    if (selectedFiles.length === 0) {
      alert('No files/folders selected. Please select something first.')
      return
    }
    const defaultName = `Group ${groups.length + 1}`
    const groupName = window.prompt('Enter a name for this group:', defaultName)
    if (!groupName) return

    const newGroup: GroupItem = {
      name: groupName,
      files: [...selectedFiles]
    }
    setGroups(prev => [...prev, newGroup])
  }

  // Quickly select all files in a group
  const selectGroup = (name: string) => {
    const found = groups.find(g => g.name === name)
    if (!found) return
    setSelectedFiles(found.files)
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

    groups,
    createGroupFromSelection,
    selectGroup
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