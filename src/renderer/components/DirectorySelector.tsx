import React, { useState } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'
import { FileList } from './FileList'
import { PromptModal } from './PromptModal'

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
  
  const handleCreateGroup = () => {
    createGroupFromSelection(groupButtonRef.current)
  }

  const handleUnselectUnnecessaryFiles = () => {
    unselectUnnecessaryFiles()
  }
  
  const handleToggleTreeCollapse = () => {
    setIsTreeCollapsed(!isTreeCollapsed)
  }

  return (
    <div className="flex flex-col gap-1 text-sm text-gray-800 dark:text-white h-full overflow-hidden">
      {/* All buttons on one row */}
      <div className="flex gap-1.5">
        <button
          onClick={handleSelectDirectory}
          className="btn btn-primary flex-1 h-8 px-2 text-xs"
          title="Select repository folder"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-1.5"
          >
            <path
              d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          Open Repo
        </button>
        <button
          onClick={handleRefreshDirectory}
          className="btn btn-secondary w-8 h-8 p-0 flex items-center justify-center"
          title="Refresh files"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 3v5h-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 21v-5h5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          ref={groupButtonRef}
          onClick={handleCreateGroup}
          className="btn btn-primary w-8 h-8 p-0 flex items-center justify-center"
          title="Create group from selected files"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <polyline
              points="14,2 14,8 20,8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 15h4M12 13v4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          onClick={handleUnselectUnnecessaryFiles}
          className="btn btn-secondary w-8 h-8 p-0 flex items-center justify-center"
          title="Remove files that don't contribute meaningful context for AI coding (lock files, build artifacts, assets, configs)"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </button>
      </div>
      
      {/* Prompt Modal */}
      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={closePromptModal}
        onConfirm={handlePromptConfirm}
        title="Create Group"
        defaultValue={modalDefaultValue}
        anchorElement={modalButtonRef}
      />

      {/* File Groups */}
      {groups.length > 0 && (
        <div className="file-group-container">
          <div className="file-group-heading">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2"
            >
              <path
                d="M4 20H20M4 4H20M9 8.5H20M9 15.5H20M4 8.5L6 11L4 13.5M4 15.5L6 18L4 20.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            File Groups
          </div>
          {groups.map(group => (
            <div
              key={group.name}
              className={`file-group-item ${activeGroupName === group.name ? 'active' : ''}`}
              title={`Toggle group "${group.name}" (${group.files.length} files)`}
            >
              <span
                onClick={() => toggleGroup(group.name)}
                className="inline-flex items-center"
              >
                {group.name}
                <span className="file-group-count">{group.files.length}</span>
              </span>
              <button
                onClick={e => {
                  e.stopPropagation()
                  if (confirm(`Are you sure you want to remove group "${group.name}"?`)) {
                    removeGroup(group.name)
                  }
                }}
                className="ml-2 text-xs text-red-600 dark:text-red-400 hover:opacity-80"
                title="Remove this group"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Always show “Current Repository” heading + FileList */}
      {/* Current Repository header */}
      <div className="flex items-center justify-between -mb-2 flex-shrink-0">
        <h4 className="text-sm font-semibold">Current Repository:</h4>
        <button
          onClick={handleToggleTreeCollapse}
          className="w-6 h-6 p-0 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title={isTreeCollapsed ? "Expand all folders" : "Collapse all folders"}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transform transition-transform duration-150 ${isTreeCollapsed ? 'rotate-0' : 'rotate-90'}`}
          >
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      
      {/* FileList takes remaining space */}
      <FileList isTreeCollapsed={isTreeCollapsed} />
    </div>
  )
}