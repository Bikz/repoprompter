/**
 * CodeEditorTabs.tsx
 * Displays each changed file in a tab with a Monaco-like editor preview.
 * User can Accept or Reject the file's changes.
 * An "Accept All" button applies all changes in one go.
 */

import React, { useState } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'
// If you want an actual Monaco Editor, install @monaco-editor/react and uncomment:
// import { Editor } from '@monaco-editor/react'

export function CodeEditorTabs() {
  const { baseDir, diffChanges, acceptAllDiffs, acceptSingleDiff, rejectSingleDiff } = useRepoContext()
  const [activeTab, setActiveTab] = useState<string | null>(
    diffChanges.length > 0 ? diffChanges[0].fileName : null
  )

  if (diffChanges.length === 0) {
    return (
      <div style={{ padding: 10, color: '#888' }}>
        <p>No changes to display. Paste AI diff to see updates here.</p>
      </div>
    )
  }

  const handleTabClick = (fileName: string) => {
    setActiveTab(fileName)
  }

  const currentFileChange = diffChanges.find(ch => ch.fileName === activeTab)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ccc', marginBottom: 8 }}>
        {diffChanges.map(change => (
          <div
            key={change.fileName}
            onClick={() => handleTabClick(change.fileName)}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              backgroundColor: change.fileName === activeTab ? '#e9ecef' : 'transparent',
              borderRight: '1px solid #ccc',
            }}
          >
            {change.fileName}
          </div>
        ))}
      </div>

      {/* Accept All button */}
      <div style={{ marginBottom: 8 }}>
        <button
          onClick={() => acceptAllDiffs()}
          style={{
            padding: '6px 12px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Accept All
        </button>
      </div>

      {/* Editor area */}
      <div style={{ flex: 1, overflow: 'auto', border: '1px solid #ddd', padding: 8 }}>
        {currentFileChange ? (
          <>
            <h4>{currentFileChange.fileName}</h4>
            {/* Placeholder for a Monaco editor. In real usage, do something like: 
                  <Editor 
                      height="300px"
                      defaultLanguage="typescript"
                      value={currentFileChange.newContent}
                  /> 
               */}
            <pre
              style={{
                background: '#f7f7f7',
                borderRadius: 4,
                padding: 8,
                whiteSpace: 'pre-wrap',
                overflowX: 'auto',
              }}
            >
              {currentFileChange.newContent}
            </pre>

            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => acceptSingleDiff(currentFileChange.fileName, currentFileChange.newContent)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  marginRight: 8,
                }}
              >
                Accept
              </button>
              <button
                onClick={() => rejectSingleDiff(currentFileChange.fileName)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Reject
              </button>
            </div>
          </>
        ) : (
          <p style={{ color: '#888' }}>Select a file tab to see changes.</p>
        )}
      </div>
    </div>
  )
}