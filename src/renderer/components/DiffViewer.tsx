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
    <div className="flex flex-col gap-2 text-sm text-gray-800 dark:text-white">
      <textarea
        className="w-full h-72 border border-gray-300 dark:border-gray-800 rounded p-2 bg-white dark:bg-off-black text-gray-800 dark:text-white"
        placeholder="Paste AI's XML diff here..."
        value={xmlDiff}
        onChange={e => setXmlDiff(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={handlePreviewDiff}
          className="btn btn-warning"
        >
          Preview Diff
        </button>
        <button
          onClick={handleApplyDiff}
          className="btn btn-danger"
        >
          Apply Diff
        </button>
      </div>
    </div>
  )
}