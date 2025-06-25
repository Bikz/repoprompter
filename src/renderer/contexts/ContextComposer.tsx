import React, { ReactNode } from 'react'
import { FileSelectionProvider, useFileSelection } from './FileSelectionContext'
import { DiffProvider } from './DiffContext'
import { GroupSettingsProvider } from './GroupSettingsContext'
import { TokenProvider } from './TokenContext'
import { FileUtilsProvider } from './FileUtilsContext'

interface ContextComposerProps {
  children: ReactNode
}

function TokenProviderWrapper({ children }: { children: ReactNode }) {
  const { selectedFiles, baseDir } = useFileSelection()
  return (
    <TokenProvider selectedFiles={selectedFiles} baseDir={baseDir}>
      {children}
    </TokenProvider>
  )
}

function DiffProviderWrapper({ children }: { children: ReactNode }) {
  const { baseDir } = useFileSelection()
  return (
    <DiffProvider baseDir={baseDir}>
      {children}
    </DiffProvider>
  )
}

function GroupSettingsProviderWrapper({ children }: { children: ReactNode }) {
  const { baseDir } = useFileSelection()
  return (
    <GroupSettingsProvider baseDir={baseDir}>
      {children}
    </GroupSettingsProvider>
  )
}

export function ContextComposer({ children }: ContextComposerProps) {
  return (
    <FileSelectionProvider>
      <GroupSettingsProviderWrapper>
        <TokenProviderWrapper>
          <DiffProviderWrapper>
            <FileUtilsProvider>
              {children}
            </FileUtilsProvider>
          </DiffProviderWrapper>
        </TokenProviderWrapper>
      </GroupSettingsProviderWrapper>
    </FileSelectionProvider>
  )
}