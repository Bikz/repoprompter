import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react'
import { getTokenInfo, calculateTokenPercentage, getTokenColorClass, shouldShowTokenInfo, formatTokenCount } from '../../common/tokenUtils'

interface TokenData {
  tokens: number
  percentage: number
  formatted: string
  colorClass: string
  shouldShow: boolean
}

interface TokenContextType {
  fileTokens: Record<string, number>
  getTokenData: (filePath: string) => TokenData | null
  updateFileTokens: (filePath: string, content: string) => void
  calculateMissingTokens: (selectedFiles: string[], baseDir: string) => Promise<void>
  totalSelectedTokens: number
  clearTokenCache: () => void
}

const TokenContext = createContext<TokenContextType | undefined>(undefined)

interface TokenProviderProps {
  children: ReactNode
  selectedFiles: string[]
  baseDir: string
}

export function TokenProvider({ children, selectedFiles, baseDir }: TokenProviderProps) {
  const [fileTokens, setFileTokens] = useState<Record<string, number>>({})

  const totalSelectedTokens = useMemo(() => {
    return selectedFiles.reduce((total, file) => {
      return total + (fileTokens[file] || 0)
    }, 0)
  }, [selectedFiles, fileTokens])

  const getTokenData = useCallback((filePath: string): TokenData | null => {
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
  }, [fileTokens, totalSelectedTokens])

  const updateFileTokens = useCallback((filePath: string, content: string) => {
    const tokenInfo = getTokenInfo(content)
    setFileTokens(prev => ({
      ...prev,
      [filePath]: tokenInfo.count
    }))
  }, [])

  const calculateMissingTokens = useCallback(async (selectedFiles: string[], baseDir: string) => {
    const filesToCalculate = selectedFiles.filter(file => 
      !fileTokens[file] && 
      !file.endsWith('/') &&
      file !== '__ROOT__'
    )
    
    if (filesToCalculate.length === 0) return

    try {
      const batchSize = 50
      for (let i = 0; i < filesToCalculate.length; i += batchSize) {
        const batch = filesToCalculate.slice(i, i + batchSize)
        const { contents } = await window.api.readMultipleFileContents(baseDir, batch)
        
        Object.entries(contents).forEach(([filePath, content]) => {
          if (content && !content.startsWith('// File too large') && !content.startsWith('// Error reading file')) {
            updateFileTokens(filePath, content)
          }
        })
        
        if (i + batchSize < filesToCalculate.length) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }
    } catch (error) {
      console.error('Error calculating tokens:', error)
    }
  }, [fileTokens, updateFileTokens])

  const clearTokenCache = useCallback(() => {
    setFileTokens({})
  }, [])

  useEffect(() => {
    if (selectedFiles.length > 0 && baseDir) {
      const timer = setTimeout(() => {
        calculateMissingTokens(selectedFiles, baseDir)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [selectedFiles, baseDir, calculateMissingTokens])

  useEffect(() => {
    clearTokenCache()
  }, [baseDir, clearTokenCache])

  const contextValue: TokenContextType = {
    fileTokens,
    getTokenData,
    updateFileTokens,
    calculateMissingTokens,
    totalSelectedTokens,
    clearTokenCache
  }

  return (
    <TokenContext.Provider value={contextValue}>
      {children}
    </TokenContext.Provider>
  )
}

export function useTokens(): TokenContextType {
  const context = useContext(TokenContext)
  if (!context) {
    throw new Error('useTokens must be used within a TokenProvider')
  }
  return context
}