import React, { useState } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'

export function DiffViewer() {
  const { applyFullDiff, setDiffXmlAndParse } = useRepoContext()
  const [xmlDiff, setXmlDiff] = useState('')

  const handlePreviewDiff = () => {
    setDiffXmlAndParse(xmlDiff)
  }

  const handleApplyDiff = async () => {
    await applyFullDiff(xmlDiff)
    setXmlDiff('')
  }

  return (
    <div className="flex flex-col gap-2 text-sm text-gray-800 dark:text-gray-100">
      <textarea
        className="w-full h-24 border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800"
        placeholder="Paste AI's XML diff here..."
        value={xmlDiff}
        onChange={e => setXmlDiff(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={handlePreviewDiff}
          className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-black rounded text-sm"
        >
          Preview Diff
        </button>
        <button
          onClick={handleApplyDiff}
          className="px-3 py-1 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded text-sm"
        >
          Apply Diff
        </button>
      </div>
    </div>
  )
}