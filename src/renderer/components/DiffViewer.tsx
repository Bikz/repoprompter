import React, { useState } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'

export function DiffViewer() {
  const { baseDir, setDiffXmlAndParse, applyFullDiff } = useRepoContext()
  const [xmlDiff, setXmlDiff] = useState('')

  const handlePreviewDiff = () => {
    setDiffXmlAndParse(xmlDiff)
  }

  const handleApplyDiff = async () => {
    await applyFullDiff(xmlDiff)
    setXmlDiff('')
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        className="w-full h-24 border border-gray-300 rounded p-2 text-sm"
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
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
        >
          Apply Diff
        </button>
      </div>
    </div>
  )
}