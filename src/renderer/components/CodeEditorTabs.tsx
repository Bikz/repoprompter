import React, { useState, useEffect } from 'react'
import { createTwoFilesPatch } from 'diff'
import { Diff2Html } from 'diff2html'
import 'diff2html/bundles/css/diff2html.min.css'
import { useRepoContext } from '../hooks/useRepoContext'

export function CodeEditorTabs() {
  const {
    diffChanges,
    acceptAllDiffs,
    acceptSingleDiff,
    rejectSingleDiff,
    getOriginalFileContent
  } = useRepoContext()
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [diffHtml, setDiffHtml] = useState('')

  // When a new set of diffs is loaded, default to the first file
  useEffect(() => {
    if (diffChanges.length > 0) {
      setActiveTab(diffChanges[0].fileName)
    } else {
      setActiveTab(null)
    }
  }, [diffChanges])

  useEffect(() => {
    const generateDiff = async () => {
      if (!activeTab) {
        setDiffHtml('')
        return
      }
      const change = diffChanges.find(ch => ch.fileName === activeTab)
      if (!change) return
      const original = await getOriginalFileContent(change.fileName)
      const patch = createTwoFilesPatch(
        change.fileName,
        change.fileName,
        original || '',
        change.newContent || ''
      )
      const html = Diff2Html.getPrettyHtml(patch, {
        inputFormat: 'diff',
        outputFormat: 'side-by-side',
        showFiles: false
      })
      setDiffHtml(html)
    }
    generateDiff()
  }, [activeTab, diffChanges, getOriginalFileContent])

  if (diffChanges.length === 0) {
    return (
      <div className="p-2 text-gray-500 dark:text-white">
        <p>No changes to display. Paste AI diff to see updates here.</p>
      </div>
    )
  }

  const handleTabClick = (fileName: string) => {
    setActiveTab(fileName)
  }

  const currentFileChange = diffChanges.find(ch => ch.fileName === activeTab)

  return (
    <div className="flex flex-col h-full text-sm text-gray-800 dark:text-white">
      {/* Tabs */}
      <div className="flex border-b border-gray-300 dark:border-gray-800 mb-2 overflow-x-auto whitespace-nowrap">
        {diffChanges.map(change => (
          <div
            key={change.fileName}
            onClick={() => handleTabClick(change.fileName)}
            className={
              "px-3 py-2 cursor-pointer border-r border-gray-300 dark:border-gray-800 " +
              (change.fileName === activeTab
                ? "bg-gray-200 dark:bg-off-black"
                : "hover:bg-gray-100 dark:hover:bg-off-black/80")
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
          className="btn btn-success"
        >
          Accept All
        </button>
      </div>

      {/* Editor area */}
      <div className="flex-1 border border-gray-300 dark:border-gray-800 rounded p-2 overflow-auto">
        {currentFileChange ? (
          <>
            <div
              className="text-xs"
              dangerouslySetInnerHTML={{ __html: diffHtml }}
            />

            <div className="mt-2 flex gap-2">
              <button
                onClick={() =>
                  acceptSingleDiff(currentFileChange.fileName, currentFileChange.newContent)
                }
                className="btn btn-success"
              >
                Accept
              </button>
              <button
                onClick={() => rejectSingleDiff(currentFileChange.fileName)}
                className="btn btn-danger"
              >
                Reject
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 dark:text-white">Select a file tab to see changes.</p>
        )}
      </div>
    </div>
  )
}