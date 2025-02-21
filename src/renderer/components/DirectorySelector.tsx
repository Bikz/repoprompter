/**
 * File: DirectorySelector.tsx
 * Description: Provides buttons to pick a repo directory, refresh files,
 * unselect large known files, and create a group from the current selection.
 */

import React from 'react'
import { useRepoContext } from '../hooks/useRepoContext'

export function DirectorySelector() {
  const {
    baseDir,
    setBaseDir,
    setFileList,
    selectedFiles,
    groups,
    createGroupFromSelection,
    selectGroup
  } = useRepoContext()

  const handleSelectDirectory = async () => {
    try {
      console.log('Opening directory dialog...')
      const selectedPath = await window.api.selectDirectory()
      if (selectedPath) {
        setBaseDir(selectedPath)
        console.log('Reading directory contents...')
        const files = await window.api.readDirectory(selectedPath)
        setFileList(files)
      }
    } catch (error) {
      console.error('Error in directory selection:', error)
    }
  }

  const handleRefreshDirectory = async () => {
    if (!baseDir) return
    try {
      console.log('Refreshing directory:', baseDir)
      const files = await window.api.readDirectory(baseDir)
      setFileList(files)
    } catch (error) {
      console.error('Error refreshing directory:', error)
    }
  }

  const handleUnselectLargeFiles = () => {
    // For demonstration only
    window.alert('Unselecting known large/unnecessary files... (Not fully implemented)')
  }

  const handleCreateGroup = () => {
    createGroupFromSelection()
  }

  const renderGroupsList = () => {
    if (groups.length === 0) return null
    return (
      <div className="mt-2">
        <h4 className="text-sm font-semibold mb-1">Groups</h4>
        <div className="flex flex-col gap-1">
          {groups.map((group) => (
            <button
              key={group.name}
              onClick={() => selectGroup(group.name)}
              className="text-left px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
              title={`Select group "${group.name}"`}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={handleSelectDirectory}
          className="px-3 py-1 bg-brand-blue hover:bg-blue-600 text-white rounded text-sm"
          title="Select repository folder"
        >
          📁 Repo
        </button>

        <button
          onClick={handleRefreshDirectory}
          className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
          title="Refresh files"
        >
          🔄
        </button>

        <button
          onClick={handleUnselectLargeFiles}
          className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
          title="Unselect known large/unnecessary files"
        >
          🗑
        </button>

        <button
          onClick={handleCreateGroup}
          className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
          title="Create group from currently selected files"
        >
          🔖
        </button>
      </div>

      {renderGroupsList()}

      {baseDir && (
        <div className="mt-2">
          <h4 className="text-sm font-semibold mb-1">Selected directory:</h4>
          <pre className="bg-gray-100 p-2 rounded text-xs break-all">
            {baseDir}
          </pre>
        </div>
      )}
    </div>
  )
}