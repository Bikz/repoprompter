import React from 'react'
import { useRepoContext } from '../hooks/useRepoContext'

export function DirectorySelector() {
  const {
    baseDir,
    setBaseDir,
    setFileList,
    createGroupFromSelection,
    groups,
    selectGroup
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          onClick={handleSelectDirectory}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow text-sm"
          title="Select repository folder"
        >
          Select Repo
        </button>
        <button
          onClick={handleRefreshDirectory}
          className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded shadow text-sm"
          title="Refresh files"
        >
          Refresh
        </button>
      </div>

      <button
        onClick={handleCreateGroup}
        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded shadow text-sm"
        title="Create group from selected files"
      >
        Create Group
      </button>

      {groups.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-1">Groups</h4>
          <div className="flex flex-col gap-1">
            {groups.map((group) => (
              <button
                key={group.name}
                onClick={() => selectGroup(group.name)}
                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm text-left"
                title={`Select group "${group.name}"`}
              >
                {group.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {baseDir && (
        <div className="mt-2">
          <h4 className="text-sm font-semibold">Current Directory:</h4>
          <pre className="bg-gray-100 p-2 rounded text-xs break-all mt-1 border border-gray-200">
            {baseDir}
          </pre>
        </div>
      )}
    </div>
  )
}