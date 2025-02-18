import React from 'react'
import { useRepoContext } from '../hooks/useRepoContext'

export function DirectorySelector() {
  const { baseDir, setBaseDir, setFileList } = useRepoContext()

  const handleSelectDirectory = async () => {
    try {
      console.log('Initiating directory selection...')
      const selectedPath = await window.api.selectDirectory()
      console.log('Selected path:', selectedPath)
      
      if (selectedPath) {
        setBaseDir(selectedPath)
        console.log('Reading directory contents...')
        const files = await window.api.readDirectory(selectedPath)
        console.log('Files found:', files)
        setFileList(files)
      }
    } catch (error) {
      console.error('Error in directory selection:', error)
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={handleSelectDirectory}
        style={{
          padding: '8px 12px',
          backgroundColor: '#007bff',
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