import React from 'react'
import { DirectorySelector } from './components/DirectorySelector'
import { FileList } from './components/FileList'
import { PromptEditor } from './components/PromptEditor'
import { DiffViewer } from './components/DiffViewer'
import { RepoProvider } from './hooks/useRepoContext'

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    backgroundColor: '#f0f0f0',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    color: '#333',
    marginBottom: '1rem',
  },
  description: {
    color: '#666',
    marginBottom: '1.5rem',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '20px',
  }
}

function App() {
  console.log('App component rendering') // Debug log

  return (
    <RepoProvider>
      <div style={styles.container}>
        <h1 style={styles.header}>RepoPrompter</h1>
        <p style={styles.description}>
          Select a directory, choose files, build a prompt, then paste AI diffs.
        </p>
        <button
          onClick={() => window.api.sayHello()}
          style={styles.button}
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