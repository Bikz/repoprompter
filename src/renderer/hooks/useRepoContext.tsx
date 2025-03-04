import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { FileChange, RepoSettings, RepoGroup } from '../../common/types'

// Use RepoGroup from types.ts instead of duplicating the type
// interface GroupItem {
//   name: string
//   files: string[]
// }

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

  groups: RepoGroup[]
  createGroupFromSelection: () => void
  selectGroup: (name: string) => void
  removeGroup: (name: string) => void
  activeGroupName: string | null
  
  userInstructions: string
  setUserInstructions: (val: string) => void

  unselectLargeFiles: () => Promise<void>
}

const RepoContext = createContext<RepoContextType | undefined>(undefined)

interface RepoProviderProps {
  children: ReactNode
}

export function RepoProvider({ children }: RepoProviderProps) {
  const [baseDir, setBaseDirState] = useState('')
  const [fileList, setFileListState] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [diffChanges, setDiffChanges] = useState<FileChange[]>([])
  const [groups, setGroups] = useState<RepoGroup[]>([])
  const [activeGroupName, setActiveGroupName] = useState<string | null>(null)
  const [userInstructions, setUserInstructionsState] = useState('')

  const toggleSelectedFile = React.useCallback((file: string) => {
    setSelectedFiles(prev =>
      prev.includes(file) ? prev.filter(f => f !== file) : [...prev, file]
    )
  }, [])

  const setFileList = (files: string[] | undefined | null) => {
    setFileListState(Array.isArray(files) ? files : [])
  }

  // Load per-repo settings (userInstructions, groups) whenever baseDir changes
  useEffect(() => {
    if (!baseDir) return
    window.api.loadRepoSettings(baseDir)
      .then(res => {
        if (res.success && res.settings) {
          const { userInstructions, groups } = res.settings
          setUserInstructionsState(userInstructions || '')
          if (Array.isArray(groups)) {
            setGroups(groups)
          }
        }
      })
      .catch(err => {
        console.error('Failed to load repo settings:', err)
      })
  }, [baseDir])

  // Called externally by DirectorySelector on a new directory selection
  const setBaseDir = async (dir: string) => {
    setBaseDirState(dir)
    try {
      const files = await window.api.readDirectory(dir)
      setFileList(files)
    } catch (error) {
      console.error('Error reading directory:', error)
    }
  }

  const setDiffXmlAndParse = async (xmlString: string) => {
    if (!xmlString?.trim() || !window.api.parseXmlDiff) return
    try {
      const changes = await window.api.parseXmlDiff(xmlString)
      setDiffChanges(changes)
    } catch (err) {
      alert(`Failed to parse diff XML: ${String(err)}`)
    }
  }

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

  const acceptAllDiffs = async () => {
    if (diffChanges.length === 0) return
    let xmlString = '<root>\n'
    diffChanges.forEach(ch => {
      xmlString += `  <file name="${ch.fileName}">\n`
      xmlString += `    <replace>${ch.newContent}</replace>\n`
      xmlString += '  </file>\n'
    })
    xmlString += '</root>'
    await applyFullDiff(xmlString)
  }

  const acceptSingleDiff = async (fileName: string, newContent: string) => {
    try {
      let xmlString = '<root>\n'
      xmlString += `  <file name="${fileName}">\n`
      xmlString += `    <replace>${newContent}</replace>\n`
      xmlString += '  </file>\n'
      xmlString += '</root>'

      const res = await window.api.applyXmlDiff(baseDir, xmlString)
      if (!res.success) {
        alert(`Failed to apply diff for ${fileName}: ${res.error}`)
        return
      }
      setDiffChanges(prev => prev.filter(fc => fc.fileName !== fileName))
      alert(`Changes for ${fileName} accepted and applied!`)
    } catch (err) {
      alert(`Error applying diff for ${fileName}: ${String(err)}`)
    }
  }

  const rejectSingleDiff = (fileName: string) => {
    setDiffChanges(prev => prev.filter(fc => fc.fileName !== fileName))
  }

  const createGroupFromSelection = async () => {
    if (selectedFiles.length === 0) {
      alert('No files/folders selected. Please select something first.')
      return
    }
    
    // Check if there are actually files to include (not just directories)
    const hasFiles = selectedFiles.some(path => !path.endsWith('/'))
    if (!hasFiles) {
      alert('Please select at least one file (not just folders) to create a group.')
      return
    }
    
    const defaultName = `Group ${groups.length + 1}`
    const groupName = window.prompt('Enter a name for this group:', defaultName)
    if (!groupName) return
    
    // Check for duplicate names
    if (groups.some(g => g.name === groupName)) {
      alert(`A group named "${groupName}" already exists. Please choose a different name.`)
      return
    }

    const newGroup: RepoGroup = { name: groupName, files: [...selectedFiles] }
    const newGroups = [...groups, newGroup]
    setGroups(newGroups)
    setActiveGroupName(groupName) // Set this group as active

    // Persist the updated repo settings
    const res = await window.api.updateRepoSettings(baseDir, {
      userInstructions,
      groups: newGroups
    })
    if (!res.success) {
      alert(`Failed to save group: ${res.error || 'Unknown error'}`)
      // Revert the group creation if save failed
      setGroups(groups)
      setActiveGroupName(null)
    } else {
      alert(`Group "${groupName}" created successfully with ${selectedFiles.length} files.`)
    }
  }

  const selectGroup = (name: string) => {
    const found = groups.find(g => g.name === name)
    if (!found) return
    setSelectedFiles(found.files)
    setActiveGroupName(name) // Track which group is active
  }

  const removeGroup = async (name: string) => {
    // Reset active group if removing the active one
    if (activeGroupName === name) {
      setActiveGroupName(null)
    }
    
    const newGroups = groups.filter(g => g.name !== name)
    setGroups(newGroups)

    // Persist the updated repo settings
    const res = await window.api.updateRepoSettings(baseDir, {
      userInstructions,
      groups: newGroups
    })
    if (!res.success) {
      alert(`Failed to remove group: ${res.error || 'Unknown error'}`)
      // Restore the removed group if delete failed
      setGroups(groups)
    } else {
      alert(`Group "${name}" removed successfully.`)
    }
  }

  const setUserInstructions = async (val: string) => {
    setUserInstructionsState(val)
    const res = await window.api.updateRepoSettings(baseDir, {
      userInstructions: val,
      groups
    })
    if (!res.success) {
      console.error('Failed to save user instructions:', res.error)
    }
  }

  const unselectLargeFiles = async () => {
    try {
      const res = await window.api.getKnownLargeFiles()
      if (!res.success || !res.list) {
        alert('Failed to retrieve large file list: ' + (res.error || 'unknown error'))
        return
      }
      const largeFiles = res.list
      setSelectedFiles(prev => prev.filter(f => !largeFiles.includes(f)))
    } catch (err) {
      console.error('unselectLargeFiles error:', err)
    }
  }

  const contextValue: RepoContextType = {
    baseDir,
    setBaseDir,
    fileList,
    setFileList,
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
    selectGroup,
    removeGroup,
    activeGroupName,

    userInstructions,
    setUserInstructions,

    unselectLargeFiles
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