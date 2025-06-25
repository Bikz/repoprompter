import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import type { RepoGroup } from '../../common/types'

interface GroupSettingsContextType {
  groups: RepoGroup[]
  activeGroupName: string | null
  userInstructions: string
  setUserInstructions: (val: string) => Promise<void>
  createGroup: (name: string, files: string[]) => Promise<void>
  selectGroup: (name: string) => void
  toggleGroup: (name: string, currentSelectedFiles: string[]) => string[]
  removeGroup: (name: string) => Promise<void>
  isPromptModalOpen: boolean
  openPromptModal: (defaultValue: string, buttonRef?: HTMLElement | null) => void
  closePromptModal: () => void
  modalDefaultValue: string
  modalButtonRef: HTMLElement | null
}

const GroupSettingsContext = createContext<GroupSettingsContextType | undefined>(undefined)

interface GroupSettingsProviderProps {
  children: ReactNode
  baseDir: string
}

export function GroupSettingsProvider({ children, baseDir }: GroupSettingsProviderProps) {
  const [groups, setGroups] = useState<RepoGroup[]>([])
  const [activeGroupName, setActiveGroupName] = useState<string | null>(null)
  const [userInstructions, setUserInstructionsState] = useState('')
  
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false)
  const [modalDefaultValue, setModalDefaultValue] = useState('')
  const [modalButtonRef, setModalButtonRef] = useState<HTMLElement | null>(null)

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

  const setUserInstructions = useCallback(async (val: string) => {
    setUserInstructionsState(val)
    const res = await window.api.updateRepoSettings(baseDir, {
      userInstructions: val,
      groups
    })
    if (!res.success) {
      console.error('Failed to save user instructions:', res.error)
    }
  }, [baseDir, groups])

  const createGroup = useCallback(async (name: string, files: string[]) => {
    if (groups.some(g => g.name === name)) {
      throw new Error(`A group named "${name}" already exists`)
    }

    const newGroup: RepoGroup = { name, files }
    const newGroups = [...groups, newGroup]
    setGroups(newGroups)
    setActiveGroupName(name)

    const res = await window.api.updateRepoSettings(baseDir, {
      userInstructions,
      groups: newGroups
    })
    if (!res.success) {
      setGroups(groups)
      setActiveGroupName(null)
      throw new Error(res.error || 'Failed to save group')
    }
  }, [baseDir, groups, userInstructions])

  const selectGroup = useCallback((name: string) => {
    const found = groups.find(g => g.name === name)
    if (found) {
      setActiveGroupName(name)
    }
  }, [groups])

  const toggleGroup = useCallback((name: string, currentSelectedFiles: string[]): string[] => {
    const found = groups.find(g => g.name === name)
    if (!found) return currentSelectedFiles

    const allGroupFilesSelected = found.files.every(file => currentSelectedFiles.includes(file))
    
    if (allGroupFilesSelected) {
      if (activeGroupName === name) {
        setActiveGroupName(null)
      }
      return currentSelectedFiles.filter(file => !found.files.includes(file))
    } else {
      setActiveGroupName(name)
      const newSelectedFiles = [...currentSelectedFiles]
      found.files.forEach(file => {
        if (!newSelectedFiles.includes(file)) {
          newSelectedFiles.push(file)
        }
      })
      return newSelectedFiles
    }
  }, [groups, activeGroupName])

  const removeGroup = useCallback(async (name: string) => {
    if (activeGroupName === name) {
      setActiveGroupName(null)
    }
    
    const newGroups = groups.filter(g => g.name !== name)
    setGroups(newGroups)

    const res = await window.api.updateRepoSettings(baseDir, {
      userInstructions,
      groups: newGroups
    })
    if (!res.success) {
      setGroups(groups)
      throw new Error(res.error || 'Failed to remove group')
    }
  }, [baseDir, groups, userInstructions, activeGroupName])

  const openPromptModal = useCallback((defaultValue: string, buttonRef?: HTMLElement | null) => {
    setModalDefaultValue(defaultValue)
    setModalButtonRef(buttonRef || null)
    setIsPromptModalOpen(true)
  }, [])

  const closePromptModal = useCallback(() => {
    setIsPromptModalOpen(false)
  }, [])

  const contextValue: GroupSettingsContextType = {
    groups,
    activeGroupName,
    userInstructions,
    setUserInstructions,
    createGroup,
    selectGroup,
    toggleGroup,
    removeGroup,
    isPromptModalOpen,
    openPromptModal,
    closePromptModal,
    modalDefaultValue,
    modalButtonRef
  }

  return (
    <GroupSettingsContext.Provider value={contextValue}>
      {children}
    </GroupSettingsContext.Provider>
  )
}

export function useGroupSettings(): GroupSettingsContextType {
  const context = useContext(GroupSettingsContext)
  if (!context) {
    throw new Error('useGroupSettings must be used within a GroupSettingsProvider')
  }
  return context
}