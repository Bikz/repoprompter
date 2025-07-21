import React, { useState } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'
import { FileList } from './FileList'
import { PromptModal } from './PromptModal'
import { Button } from './ui/Button'
import { Card, CardHeader, CardBody } from './ui/Card'

export function DirectorySelector() {
  const {
    baseDir,
    setBaseDir,
    setFileList,
    createGroupFromSelection,
    groups,
    selectGroup,
    toggleGroup,
    removeGroup,
    activeGroupName,
    unselectUnnecessaryFiles,
    isPromptModalOpen,
    closePromptModal,
    modalDefaultValue,
    handlePromptConfirm,
    modalButtonRef
  } = useRepoContext()
  
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false)

  const handleSelectDirectory = async () => {
    try {
      const selectedPath = await window.api.selectDirectory()
      if (selectedPath) {
        setBaseDir(selectedPath)
        const files = await window.api.readDirectory(selectedPath)
        setFileList(files)
      }
    } catch (error) {
      console.error('Error selecting directory:', error)
    }
  }

  const handleRefreshDirectory = async () => {
    if (!baseDir) return
    try {
      const files = await window.api.readDirectory(baseDir)
      setFileList(files) // This will clear token cache via setFileList
    } catch (error) {
      console.error('Error refreshing directory:', error)
    }
  }

  const groupButtonRef = React.useRef<HTMLButtonElement>(null)

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Repository Card */}
      <Card className="flex-shrink-0">
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <h3 className="text-sm font-semibold text-primary">Repository</h3>
            </div>
            <Button onClick={handleSelectDirectory} variant="primary" size="sm">
              Open Repo
            </Button>
          </div>

          {baseDir ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="truncate">{baseDir.split('/').pop()}</span>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2">
                <Button onClick={handleRefreshDirectory} variant="secondary" size="sm" className="flex-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </Button>
                <Button onClick={createGroupFromSelection} variant="secondary" size="sm" className="flex-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Save Group
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-tertiary text-center py-4">
              No repository selected
            </p>
          )}
        </CardBody>
      </Card>

      {/* File Groups */}
      {groups.length > 0 && (
        <Card className="flex-shrink-0">
          <CardBody className="p-4">
            <h3 className="text-sm font-semibold text-primary mb-3">File Groups</h3>
            <div className="space-y-1">
              {groups.map((group) => (
                <div
                  key={group.name}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-md transition-all cursor-pointer
                    ${activeGroupName === group.name 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-secondary'
                    }`}
                  onClick={() => selectGroup(group.name)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleGroup(group.name)
                    }}
                    className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                  >
                    <svg 
                      className={`w-3 h-3 transition-transform ${
                        activeGroupName === group.name ? 'rotate-90' : ''
                      }`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <span className="flex-1 text-sm font-medium truncate">{group.name}</span>
                  <span className="text-xs bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full">
                    {group.files.length}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeGroup(group.name)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-danger/10 text-danger transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* File Tree */}
      {baseDir && (
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Files</h3>
              <Button
                onClick={() => setIsTreeCollapsed(!isTreeCollapsed)}
                variant="ghost"
                size="sm"
                className="p-1"
              >
                <svg 
                  className={`w-4 h-4 transition-transform ${isTreeCollapsed ? '' : 'rotate-90'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
            <Button
              onClick={unselectUnnecessaryFiles}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              Clean Selection
            </Button>
          </CardHeader>
          {!isTreeCollapsed && (
            <CardBody className="p-2 overflow-auto">
              <FileList />
            </CardBody>
          )}
        </Card>
      )}

      {/* Prompt Modal */}
      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={closePromptModal}
        onConfirm={handlePromptConfirm}
        defaultValue={modalDefaultValue}
        triggerRef={modalButtonRef}
      />
    </div>
  )
}