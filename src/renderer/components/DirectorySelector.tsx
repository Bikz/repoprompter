/**
 * DirectorySelector.tsx
 * Lets user pick a local directory. Calls preload API to open system dialog.
 */

import React from 'react'
import { useRepoContext } from '../hooks/useRepoContext'

export function DirectorySelector() {
  const { baseDir, setBaseDir, setFileList } = useRepoContext()

  const handleSelectDirectory = async () => {
    const selectedPath = await window.api.selectDirectory()
    if (selectedPath) {
      setBaseDir(selectedPath)
      const files = window.api.readDirectory(selectedPath)
      setFileList(files)
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={handleSelectDirectory}
        style={{
          padding: '8px 12px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Select Directory
      </button>
      {baseDir && (
        <div style={{ marginTop: 8 }}>
          Selected directory:
          <pre style={{ margin: 0 }}>{baseDir}</pre>
        </div>
      )}
    </div>
  )
}