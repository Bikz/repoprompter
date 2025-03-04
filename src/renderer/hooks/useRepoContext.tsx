import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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

  groups: GroupItem[]
  createGroupFromSelection: () => void
  selectGroup: (name: string) => void
  removeGroup: (name: string) => void

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
  const [groups, setGroups] = useState<GroupItem[]>([])
  const [userInstructions, setUserInstructionsState] = useState('')

  const toggleSelectedFile = React.useCallback((file: string) => {
    setSelectedFiles(prev =>
      prev.includes(file) ? prev.filter(f => f !== file) : [...prev, file]
    )
  }, [])

  const setFileList = (files: string[] | undefined | null) => {
    setFileListState(Array.isArray(files) ? files : [])
  }

  useEffect(() => {
    if (!baseDir) return
    // Attempt to load per-repo settings
    window.api?.invoke?.('config:loadRepoSettings', baseDir)
      .then((res: any) => {
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
    const defaultName = `Group ${groups.length + 1}`
    const groupName = window.prompt('Enter a name for this group:', defaultName)
    if (!groupName) return

    const newGroup: GroupItem = { name: groupName, files: [...selectedFiles] }
    const newGroups = [...groups, newGroup]
    setGroups(newGroups)

    // Persist
    await window.api.invoke('config:updateRepoSettings', {
      repoPath: baseDir,
      updates: { userInstructions, groups: newGroups }
    })
  }

  const selectGroup = (name: string) => {
    const found = groups.find(g => g.name === name)
    if (!found) return
    setSelectedFiles(found.files)
  }

  const removeGroup = async (name: string) => {
    const newGroups = groups.filter(g => g.name !== name)
    setGroups(newGroups)

    // Persist
    try {
      await window.api.invoke('config:updateRepoSettings', {
        repoPath: baseDir,
        updates: { userInstructions, groups: newGroups }
      })
    } catch (err) {
      console.error('Failed to remove group:', err)
    }
  }

  const setUserInstructions = async (val: string) => {
    setUserInstructionsState(val)
    try {
      await window.api.invoke('config:updateRepoSettings', {
        repoPath: baseDir,
        updates: { userInstructions: val, groups }
      })
    } catch (err) {
      console.error('Failed to save user instructions:', err)
    }
  }

  const unselectLargeFiles = async () => {
    try {
      const res = await window.api.invoke('config:getKnownLargeFiles')
      if (!res.success) {
        alert('Failed to retrieve large file list: ' + res.error)
        return
      }
      const largeFiles: string[] = res.list || []
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