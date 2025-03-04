import React from 'react'
import { useRepoContext } from '../hooks/useRepoContext'

export function DirectorySelector() {
  const {
    baseDir,
    setBaseDir,
    setFileList,
    createGroupFromSelection,
    groups,
    selectGroup,
    unselectLargeFiles
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
      setFileList(files)
    } catch (error) {
      console.error('Error refreshing directory:', error)
    }
  }

  const handleCreateGroup = () => {
    createGroupFromSelection()
  }

  const handleUnselectLargeFiles = () => {
    unselectLargeFiles()
  }

  return (
    <div className="flex flex-col gap-3 text-sm text-gray-800 dark:text-gray-100">
      <div className="flex gap-2">
        <button
          onClick={handleSelectDirectory}
          className="flex-1 px-3 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded shadow"
          title="Select repository folder"
        >
          Select Repo
        </button>
        <button
          onClick={handleRefreshDirectory}
          className="px-3 py-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white rounded shadow"
          title="Refresh files"
        >
          Refresh
        </button>
      </div>

      <button
        onClick={handleCreateGroup}
        className="file-group-button"
        title="Create group from selected files"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          xmlns="http://www.w3.org/2000/svg" className="mr-2">
          <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Create Group
      </button>

      <button
        onClick={handleUnselectLargeFiles}
        className="px-3 py-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white rounded shadow text-sm"
        title="Unselect large files to improve performance"
      >
        Unselect Large Files
      </button>

      {groups.length > 0 && (
        <div className="file-group-container">
          <div className="file-group-heading">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M4 20H20M4 4H20M9 8.5H20M9 15.5H20M4 8.5L6 11L4 13.5M4 15.5L6 18L4 20.5" 
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            File Groups
          </div>
          {groups.map((group) => (
            <button
              key={group.name}
              onClick={() => selectGroup(group.name)}
              className="file-group-item"
              title={`Select group "${group.name}" (${group.files.length} files)`}
            >
              <span className="file-group-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9L11 6H19C20.1046 6 21 6.89543 21 8V19C21 20.1046 20.1046 21 19 21Z" 
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              {group.name}
              <span className="file-group-count">
                {group.files.length}
              </span>
            </button>
          ))}
        </div>
      )}

      {baseDir && (
        <div className="mt-2">
          <h4 className="text-sm font-semibold">Current Repository:</h4>
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs mt-1 border border-gray-200 dark:border-gray-700 flex items-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg" className="mr-1 text-gray-600 dark:text-gray-200">
              <path d="M15 4.5C14.6022 4.5 14.2206 4.34196 13.9393 4.06066C13.658 3.77936 13.5 3.39782 13.5 3C13.5 2.60218 13.658 2.22064 13.9393 1.93934C14.2206 1.65804 14.6022 1.5 15 1.5C15.3978 1.5 15.7794 1.65804 16.0607 1.93934C16.342 2.22064 16.5 2.60218 16.5 3C16.5 3.39782 16.342 3.77936 16.0607 4.06066C15.7794 4.34196 15.3978 4.5 15 4.5ZM9 4.5C8.60218 4.5 8.22064 4.34196 7.93934 4.06066C7.65804 3.77936 7.5 3.39782 7.5 3C7.5 2.60218 7.65804 2.22064 7.93934 1.93934C8.22064 1.65804 8.60218 1.5 9 1.5C9.39782 1.5 9.77936 1.65804 10.0607 1.93934C10.342 2.22064 10.5 2.60218 10.5 3C10.5 3.39782 10.342 3.77936 10.0607 4.06066C9.77936 4.34196 9.39782 4.5 9 4.5ZM21 15V16.5C21 17.0304 20.7893 17.5391 20.4142 17.9142C20.0391 18.2893 19.5304 18.5 19 18.5H5C4.46957 18.5 3.96086 18.2893 3.58579 17.9142C3.21071 17.5391 3 17.0304 3 16.5V15H21ZM21 13.5H3V7.5C3 6.96957 3.21071 6.46086 3.58579 6.08579C3.96086 5.71071 4.46957 5.5 5 5.5H19C19.5304 5.5 20.0391 5.71071 20.4142 6.08579C20.7893 6.46086 21 6.96957 21 7.5V13.5ZM9 21.5C8.60218 21.5 8.22064 21.342 7.93934 21.0607C7.65804 20.7794 7.5 20.3978 7.5 20C7.5 19.6022 7.65804 19.2206 7.93934 18.9393C8.22064 18.658 8.60218 18.5 9 18.5C9.39782 18.5 9.77936 18.658 10.0607 18.9393C10.342 19.2206 10.5 19.6022 10.5 20C10.5 20.3978 10.342 20.7794 10.0607 21.0607C9.77936 21.342 9.39782 21.5 9 21.5ZM15 21.5C14.6022 21.5 14.2206 21.342 13.9393 21.0607C13.658 20.7794 13.5 20.3978 13.5 20C13.5 19.6022 13.658 19.2206 13.9393 18.9393C14.2206 18.658 14.6022 18.5 15 18.5C15.3978 18.5 15.7794 18.658 16.0607 18.9393C16.342 19.2206 16.5 19.6022 16.5 20C16.5 20.3978 16.342 20.7794 16.0607 21.0607C15.7794 21.342 15.3978 21.5 15 21.5Z" 
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-medium">{baseDir.split('/').pop()}</span>
            <span className="ml-1 text-gray-500 dark:text-gray-300 truncate" title={baseDir}>
              ({baseDir})
            </span>
          </div>
        </div>
      )}
    </div>
  )
}