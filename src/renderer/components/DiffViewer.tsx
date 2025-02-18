/**
 * DiffViewer.tsx
 * Where user pastes the AI's XML diff. We parse it, show a preview, and user can accept or reject
 */

import React, { useState } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'
import { parseDiffXml } from '@/common/diffParser' // if you want to re-parse client-side

export function DiffViewer() {
  const { baseDir } = useRepoContext()
  const [xmlDiff, setXmlDiff] = useState('')
  const [preview, setPreview] = useState<{ fileName: string; newContent: string }[]>([])

  const handlePreviewDiff = () => {
    // Just parse it on the client side
    const changes = parseDiffXml(xmlDiff)
    setPreview(changes)
  }

  const handleApplyDiff = async () => {
    const res = await window.api.applyXmlDiff(baseDir, xmlDiff)
    if (res.success) {
      alert('Diff applied successfully!')
    } else {
      alert(`Failed to apply diff: ${res.error}`)
    }
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

      {preview.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Preview Changes</h4>
          {preview.map(change => (
            <div key={change.fileName} style={{ marginBottom: 12 }}>
              <strong>{change.fileName}</strong>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  background: '#f7f7f7',
                  padding: 8,
                  borderRadius: 4,
                  overflowX: 'auto',
                }}
              >
{change.newContent}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}