import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { FileChange } from '../../common/types'

interface DiffContextType {
  diffChanges: FileChange[]
  setDiffXmlAndParse: (xmlString: string) => Promise<void>
  applyFullDiff: (xmlString: string) => Promise<void>
  acceptAllDiffs: () => Promise<void>
  acceptSingleDiff: (fileName: string, newContent: string) => Promise<void>
  rejectSingleDiff: (fileName: string) => void
  clearDiffs: () => void
}

const DiffContext = createContext<DiffContextType | undefined>(undefined)

interface DiffProviderProps {
  children: ReactNode
  baseDir: string
}

export function DiffProvider({ children, baseDir }: DiffProviderProps) {
  const [diffChanges, setDiffChanges] = useState<FileChange[]>([])

  const setDiffXmlAndParse = useCallback(async (xmlString: string) => {
    if (!xmlString?.trim() || !window.api.parseXmlDiff) return
    try {
      const changes = await window.api.parseXmlDiff(xmlString)
      setDiffChanges(changes)
    } catch (err) {
      alert(`Failed to parse diff XML: ${String(err)}`)
    }
  }, [])

  const applyFullDiff = useCallback(async (xmlString: string) => {
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
  }, [baseDir])

  const acceptAllDiffs = useCallback(async () => {
    if (diffChanges.length === 0) return
    let xmlString = '<root>\n'
    diffChanges.forEach(ch => {
      xmlString += `  <file name="${ch.fileName}">\n`
      xmlString += `    <replace>${ch.newContent}</replace>\n`
      xmlString += '  </file>\n'
    })
    xmlString += '</root>'
    await applyFullDiff(xmlString)
  }, [diffChanges, applyFullDiff])

  const acceptSingleDiff = useCallback(async (fileName: string, newContent: string) => {
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
  }, [baseDir])

  const rejectSingleDiff = useCallback((fileName: string) => {
    setDiffChanges(prev => prev.filter(fc => fc.fileName !== fileName))
  }, [])

  const clearDiffs = useCallback(() => {
    setDiffChanges([])
  }, [])

  const contextValue: DiffContextType = {
    diffChanges,
    setDiffXmlAndParse,
    applyFullDiff,
    acceptAllDiffs,
    acceptSingleDiff,
    rejectSingleDiff,
    clearDiffs
  }

  return (
    <DiffContext.Provider value={contextValue}>
      {children}
    </DiffContext.Provider>
  )
}

export function useDiff(): DiffContextType {
  const context = useContext(DiffContext)
  if (!context) {
    throw new Error('useDiff must be used within a DiffProvider')
  }
  return context
}