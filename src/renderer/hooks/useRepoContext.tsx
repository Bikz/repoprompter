import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react'
import type { FileChange, RepoSettings, RepoGroup } from '../../common/types'
import { getTokenInfo, calculateTokenPercentage, getTokenColorClass, shouldShowTokenInfo, formatTokenCount } from '../../common/tokenUtils'

// Use RepoGroup from types.ts instead of duplicating the type
// interface GroupItem {
//   name: string
//   files: string[]
// }

interface TokenData {
  tokens: number
  percentage: number
  formatted: string
  colorClass: string
  shouldShow: boolean
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
  getOriginalFileContent: (fileName: string) => Promise<string>

  groups: RepoGroup[]
  createGroupFromSelection: (buttonElement?: HTMLElement | null) => void
  selectGroup: (name: string) => void
  toggleGroup: (name: string) => void
  removeGroup: (name: string) => void
  activeGroupName: string | null
  
  userInstructions: string
  setUserInstructions: (val: string) => void

  unselectUnnecessaryFiles: () => void
  
  // Token management
  fileTokens: Record<string, number>
  getTokenData: (filePath: string) => TokenData | null
  updateFileTokens: (filePath: string, content: string) => void
  calculateMissingTokens: () => Promise<void>
  totalSelectedTokens: number
  
  // Modal state for group creation
  isPromptModalOpen: boolean
  closePromptModal: () => void
  modalDefaultValue: string
  handlePromptConfirm: (value: string) => void
  modalButtonRef: HTMLElement | null
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
  const [originalFileCache, setOriginalFileCache] = useState<Record<string, string>>({})
  const [groups, setGroups] = useState<RepoGroup[]>([])
  const [activeGroupName, setActiveGroupName] = useState<string | null>(null)
  const [userInstructions, setUserInstructionsState] = useState('')
  
  // Token tracking state
  const [fileTokens, setFileTokens] = useState<Record<string, number>>({})
  
  // State for prompt modal
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false)
  const [modalDefaultValue, setModalDefaultValue] = useState('')
  const [modalButtonRef, setModalButtonRef] = useState<HTMLElement | null>(null)

  const toggleSelectedFile = React.useCallback((file: string) => {
    setSelectedFiles(prev =>
      prev.includes(file) ? prev.filter(f => f !== file) : [...prev, file]
    )
  }, [])

  const setFileList = (files: string[] | undefined | null) => {
    setFileListState(Array.isArray(files) ? files : [])
    // Clear token cache when file list changes
    setFileTokens({})
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

  // Calculate tokens when selected files change
  useEffect(() => {
    if (selectedFiles.length > 0 && baseDir) {
      // Quick calculation - token estimation is very fast
      const timer = setTimeout(() => {
        calculateMissingTokens()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [selectedFiles, baseDir])

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

  // Calculate total tokens for selected files
  const totalSelectedTokens = useMemo(() => {
    return selectedFiles.reduce((total, file) => {
      return total + (fileTokens[file] || 0)
    }, 0)
  }, [selectedFiles, fileTokens])

  // Get token data for a specific file
  const getTokenData = (filePath: string): TokenData | null => {
    const tokens = fileTokens[filePath]
    if (!tokens) return null

    const percentage = calculateTokenPercentage(tokens, totalSelectedTokens)
    const colorClass = getTokenColorClass(percentage)
    const shouldShow = shouldShowTokenInfo(percentage)

    return {
      tokens,
      percentage,
      formatted: formatTokenCount(tokens),
      colorClass,
      shouldShow
    }
  }

  // Update file tokens when content is read
  const updateFileTokens = (filePath: string, content: string) => {
    const tokenInfo = getTokenInfo(content)
    setFileTokens(prev => ({
      ...prev,
      [filePath]: tokenInfo.count
    }))
  }

  // Calculate tokens for selected files that don't have them yet
  const calculateMissingTokens = async () => {
    const filesToCalculate = selectedFiles.filter(file => 
      !fileTokens[file] && 
      !file.endsWith('/') && // Exclude folders
      file !== '__ROOT__' // Exclude root
    )
    
    if (filesToCalculate.length === 0) return

    try {
      // Process in batches for better performance with large selections
      const batchSize = 50
      for (let i = 0; i < filesToCalculate.length; i += batchSize) {
        const batch = filesToCalculate.slice(i, i + batchSize)
        const { contents } = await window.api.readMultipleFileContents(baseDir, batch)
        
        Object.entries(contents).forEach(([filePath, content]) => {
          if (content && !content.startsWith('// File too large') && !content.startsWith('// Error reading file')) {
            updateFileTokens(filePath, content)
          }
        })
        
        // Small delay between batches to keep UI responsive
        if (i + batchSize < filesToCalculate.length) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }
    } catch (error) {
      console.error('Error calculating tokens:', error)
    }
  }

  const getOriginalFileContent = async (fileName: string): Promise<string> => {
    if (originalFileCache[fileName]) return originalFileCache[fileName]
    try {
      const content = await window.api.readFileContents(baseDir, fileName)
      setOriginalFileCache(prev => ({ ...prev, [fileName]: content }))
      return content
    } catch (error) {
      console.error('Failed to read original file:', error)
      return ''
    }
  }

  const setDiffXmlAndParse = async (xmlString: string) => {
    if (!xmlString?.trim() || !window.api.parseXmlDiff) return
    try {
      const changes = await window.api.parseXmlDiff(xmlString)
      setDiffChanges(changes)
      const cache: Record<string, string> = {}
      await Promise.all(
        changes.map(async ch => {
          try {
            cache[ch.fileName] = await window.api.readFileContents(baseDir, ch.fileName)
          } catch (err) {
            console.error('Failed to read file for diff', ch.fileName, err)
            cache[ch.fileName] = ''
          }
        })
      )
      setOriginalFileCache(cache)
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
        setOriginalFileCache({})
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
    setOriginalFileCache({})
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
      setOriginalFileCache(prev => {
        const { [fileName]: _, ...rest } = prev
        return rest
      })
      alert(`Changes for ${fileName} accepted and applied!`)
    } catch (err) {
      alert(`Error applying diff for ${fileName}: ${String(err)}`)
    }
  }

  const rejectSingleDiff = (fileName: string) => {
    setDiffChanges(prev => prev.filter(fc => fc.fileName !== fileName))
    setOriginalFileCache(prev => {
      const { [fileName]: _, ...rest } = prev
      return rest
    })
  }

  const handlePromptConfirm = async (groupName: string) => {
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
    setIsPromptModalOpen(false) // Close modal

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
    }
  }
  
  const closePromptModal = () => setIsPromptModalOpen(false)
  
  const createGroupFromSelection = (buttonElement?: HTMLElement | null) => {
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
    setModalDefaultValue(defaultName)
    setModalButtonRef(buttonElement || null)
    setIsPromptModalOpen(true)
  }

  const selectGroup = (name: string) => {
    const found = groups.find(g => g.name === name)
    if (!found) return
    setSelectedFiles(found.files)
    setActiveGroupName(name) // Track which group is active
  }

  const toggleGroup = (name: string) => {
    const found = groups.find(g => g.name === name)
    if (!found) return
    
    // Check if all files in the group are currently selected
    const allGroupFilesSelected = found.files.every(file => selectedFiles.includes(file))
    
    if (allGroupFilesSelected) {
      // Unselect all files in the group
      const newSelectedFiles = selectedFiles.filter(file => !found.files.includes(file))
      setSelectedFiles(newSelectedFiles)
      // Clear active group if we're deselecting it
      if (activeGroupName === name) {
        setActiveGroupName(null)
      }
    } else {
      // Select all files in the group (add any missing ones)
      const newSelectedFiles = [...selectedFiles]
      found.files.forEach(file => {
        if (!newSelectedFiles.includes(file)) {
          newSelectedFiles.push(file)
        }
      })
      setSelectedFiles(newSelectedFiles)
      setActiveGroupName(name)
    }
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

  const unselectUnnecessaryFiles = () => {
    // Define patterns for files that don't contribute meaningful context for AI coding
    const unnecessaryPatterns = [
      // Lock files - massive but don't contain code logic
      'package-lock.json',
      'pnpm-lock.yaml', 
      'yarn.lock',
      'composer.lock',
      'Pipfile.lock',
      'poetry.lock',
      'Gemfile.lock',
      'go.sum',
      'Cargo.lock',
      
      // Build/dist directories and files
      /^(dist|build|out|target|release)[\\/]/,
      /^\.next[\\/]/,
      /^\.nuxt[\\/]/,
      /^\.output[\\/]/,
      /^public[\\/].*\.(js|css|map)$/,
      
      // Dependencies
      /^node_modules[\\/]/,
      /^vendor[\\/]/,
      /^__pycache__[\\/]/,
      
      // Config files (useful but not critical for understanding code logic)
      /\.(config|conf)\.(js|ts|json|yaml|yml)$/,
      'webpack.config.js',
      'vite.config.js',
      'rollup.config.js',
      'babel.config.js',
      '.eslintrc.json',
      '.prettierrc',
      'jest.config.js',
      'cypress.config.js',
      'playwright.config.js',
      'tailwind.config.js',
      'postcss.config.js',
      
      // Documentation and meta files
      /^README\.(md|txt|rst)$/i,
      /^CHANGELOG\.(md|txt|rst)$/i,
      /^LICENSE(\.(md|txt))?$/i,
      /^CONTRIBUTING\.(md|txt)$/i,
      '.gitignore',
      '.gitattributes',
      '.dockerignore',
      
      // IDE/Editor files
      /^\.vscode[\\/]/,
      /^\.idea[\\/]/,
      /^\.vs[\\/]/,
      '*.swp',
      '*.swo',
      '*~',
      
      // Assets that don't contain logic
      /\.(png|jpe?g|gif|svg|ico|webp|avif)$/i,
      /\.(mp4|avi|mov|wmv|flv|webm)$/i,
      /\.(mp3|wav|ogg|m4a|aac)$/i,
      /\.(woff2?|ttf|eot|otf)$/i,
      /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i,
      
      // Generated/compiled files
      /\.min\.(js|css)$/,
      /\.map$/,
      /\.d\.ts$/,
      /coverage[\\/]/,
      /\.nyc_output[\\/]/,
      /logs?[\\/]/,
      /tmp[\\/]/,
      /temp[\\/]/,
      
      // Environment and secrets (shouldn't be selected anyway)
      /^\.env(\.|$)/,
      '.DS_Store',
      'Thumbs.db',
      
      // Large data files
      /\.(csv|json|xml|sql)$/i, // Only if they're likely data files, not config
      
      // Test fixtures and mock data (keep actual test files)
      /[\\/](fixtures|mocks|__fixtures__|__mocks__)[\\/]/,
      /\.fixtures?\.(js|ts|json)$/,
      /\.mock\.(js|ts)$/,
    ]
    
    const isUnnecessary = (filePath: string): boolean => {
      return unnecessaryPatterns.some(pattern => {
        if (typeof pattern === 'string') {
          return filePath.endsWith(pattern) || filePath.includes(`/${pattern}`) || filePath === pattern
        } else {
          return pattern.test(filePath)
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
    getOriginalFileContent,

    groups,
    createGroupFromSelection,
    selectGroup,
    toggleGroup,
    removeGroup,
    activeGroupName,

    userInstructions,
    setUserInstructions,

    unselectUnnecessaryFiles,
    
    // Token management
    fileTokens,
    getTokenData,
    updateFileTokens,
    calculateMissingTokens,
    totalSelectedTokens,
    
    // Modal state
    isPromptModalOpen,
    closePromptModal,
    modalDefaultValue,
    handlePromptConfirm,
    modalButtonRef
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