import React from 'react'
import { useRepoContext } from '../hooks/useRepoContext'

export function FileList() {
  const { fileList, selectedFiles, toggleSelectedFile } = useRepoContext()

  // Ensure fileList is an array and log its current state
  console.log('FileList state:', {
    fileList,
    isArray: Array.isArray(fileList),
    length: fileList?.length
  })

  // Guard against non-array fileList
  const files = Array.isArray(fileList) ? fileList : []

  if (files.length === 0) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        color: '#6c757d'
      }}>
        No files. Please select a directory.
      </div>
    )
  }

  return (
    <div style={{
      maxHeight: 300,
      overflowY: 'auto',
      backgroundColor: '#fff',
      padding: 16,
      border: '1px solid #dee2e6',
      borderRadius: '4px'
    }}>
      {files.map(file => {
        const isChecked = selectedFiles.includes(file)
        return (
          <div key={file} style={{ marginBottom: 8 }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleSelectedFile(file)}
                style={{ marginRight: 8 }}
              />
              <span style={{
                fontFamily: 'monospace',
                fontSize: '14px'
              }}>
                {file}
              </span>
            </label>
          </div>
        )
      })}
    </div>
  )
}