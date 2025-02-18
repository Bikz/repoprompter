/**
 * FileList.tsx
 * Shows the list of files from the chosen directory with checkboxes
 */

import React from 'react'
import { useRepoContext } from '../hooks/useRepoContext'

export function FileList() {
  const { fileList, selectedFiles, toggleSelectedFile } = useRepoContext()

  if (!fileList.length) {
    return <p>No files. Please select a directory.</p>
  }

  return (
    <div style={{ maxHeight: 200, overflowY: 'auto', background: '#fff', padding: 8 }}>
      {fileList.map(file => {
        const isChecked = selectedFiles.includes(file)
        return (
          <div key={file} style={{ marginBottom: 4 }}>
            <label>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleSelectedFile(file)}
              />
              {file}
            </label>
          </div>
        )
      })}
    </div>
  )
}