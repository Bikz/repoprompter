import React, { useState } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'

export function CodeEditorTabs() {
  const { diffChanges, acceptAllDiffs, acceptSingleDiff, rejectSingleDiff } = useRepoContext()
  const [activeTab, setActiveTab] = useState<string | null>(
    diffChanges.length > 0 ? diffChanges[0].fileName : null
  )

  if (diffChanges.length === 0) {
    return (
      <div className="p-2 text-gray-500">
        <p>No changes to display. Paste AI diff to see updates here.</p>
      </div>
    )
  }

  const handleTabClick = (fileName: string) => {
    setActiveTab(fileName)
  }

  const currentFileChange = diffChanges.find(ch => ch.fileName === activeTab)

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-2">
        {diffChanges.map(change => (
          <div
            key={change.fileName}
            onClick={() => handleTabClick(change.fileName)}
            className={
              "px-3 py-2 text-sm cursor-pointer " +
              (change.fileName === activeTab
                ? "bg-gray-200 border-r border-gray-300"
                : "hover:bg-gray-100 border-r border-gray-300")
            }
          >
            {change.fileName}
          </div>
        ))}
      </div>

      {/* Accept All */}
      <div className="mb-2">
        <button
          onClick={() => acceptAllDiffs()}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
        >
          Accept All
        </button>
      </div>

      {/* Editor area */}
      <div className="flex-1 border border-gray-300 rounded p-2 overflow-auto">
        {currentFileChange ? (
          <>
            <pre className="bg-gray-50 rounded p-2 text-xs overflow-auto whitespace-pre-wrap">
              {currentFileChange.newContent}
            </pre>

            <div className="mt-2 flex gap-2">
              <button
                onClick={() =>
                  acceptSingleDiff(currentFileChange.fileName, currentFileChange.newContent)
                }
                className="px-3 py-1 bg-brand-blue hover:bg-brand-blue/90 text-white rounded text-sm"
              >
                Accept
              </button>
              <button
                onClick={() => rejectSingleDiff(currentFileChange.fileName)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              >
                Reject
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Select a file tab to see changes.</p>
        )}
      </div>
    </div>
  )
}