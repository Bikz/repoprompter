/**
 * Main React App
 * Renders UI components: DirectorySelector, FileList, PromptEditor, DiffViewer
 */

import React from 'react'
import { DirectorySelector } from './components/DirectorySelector'
import { FileList } from './components/FileList'
import { PromptEditor } from './components/PromptEditor'
import { DiffViewer } from './components/DiffViewer'
import { RepoProvider } from './hooks/useRepoContext'

function App() {
  return (
    <RepoProvider>
      <div
        style={{
          padding: 20,
          fontFamily: 'sans-serif',
          backgroundColor: '#f0f0f0',
          minHeight: '100vh',
        }}
      >
        <h1 style={{ color: '#333' }}>RepoPrompter</h1>
        <p style={{ color: '#666' }}>
          Select a directory, choose files, build a prompt, then paste AI diffs.
        </p>
        <button
          onClick={() => window.api.sayHello()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: 20,
          }}
        >
          Test Preload API
        </button>

        <DirectorySelector />
        <FileList />
        <PromptEditor />
        <DiffViewer />
      </div>
    </RepoProvider>
  )
}

export default App