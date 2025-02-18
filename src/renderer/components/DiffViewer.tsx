/**
 * DiffViewer.tsx
 * Textarea for the AI's XML diff. "Preview" button parses diff into context.
 * "Apply Diff" button still applies everything at once if desired.
 */

import React, { useState } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'

export function DiffViewer() {
  const { baseDir, setDiffXmlAndParse, applyFullDiff } = useRepoContext()
  const [xmlDiff, setXmlDiff] = useState('')

  const handlePreviewDiff = () => {
    // Parse it and store results in context
    setDiffXmlAndParse(xmlDiff)
  }

  const handleApplyDiff = async () => {
    // If user wants to apply the entire diff right now
    await applyFullDiff(xmlDiff)
    setXmlDiff('')
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Diff Viewer</h3>
      <textarea
        style={{ width: '100%', height: 120 }}
        placeholder="Paste AI's XML diff here..."
        value={xmlDiff}
        onChange={e => setXmlDiff(e.target.value)}
      />
      <div style={{ marginTop: 8 }}>
        <button
          onClick={handlePreviewDiff}
          style={{
            padding: '6px 12px',
            marginRight: 8,
            background: '#ffc107',
            color: '#000',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Preview Diff
        </button>
        <button
          onClick={handleApplyDiff}
          style={{
            padding: '6px 12px',
            background: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Apply Diff
        </button>
      </div>
    </div>
  )
}