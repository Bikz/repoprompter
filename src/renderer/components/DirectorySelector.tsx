import React from 'react'
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

  return (
    <div className="flex flex-col gap-3 text-sm text-gray-800 dark:text-white h-full overflow-hidden">
      {/* Top row of buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSelectDirectory}
          className="btn btn-primary flex-1"
          title="Select repository folder"
        >
          Select Repo
        </button>
        <button
          onClick={handleRefreshDirectory}
          className="btn btn-secondary"
          title="Refresh files"
        >
          Refresh
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

      <button
        ref={groupButtonRef}
        onClick={handleCreateGroup}
        className="btn btn-primary"
        title="Create group from selected files"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mr-2"
        >
          <path
            d="M12 4V20M4 12H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Group Selected Files
      </button>

      <button
        onClick={handleUnselectUnnecessaryFiles}
        className="btn btn-secondary"
        title="Remove files that don't contribute meaningful context for AI coding (lock files, build artifacts, assets, configs)"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mr-2"
        >
          <path
            d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Smart Filter
      </button>

      {/* Always show “Current Repository” heading + FileList */}
      <div className="mt-4 flex-1 min-h-0 flex flex-col overflow-y-auto">
        <h4 className="text-sm font-semibold mb-2 flex-shrink-0">Current Repository:</h4>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <FileList />
        </div>
      </div>
    </div>
  )
}