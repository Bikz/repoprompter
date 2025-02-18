import React from 'react'
import { DirectorySelector } from './components/DirectorySelector'
import { FileList } from './components/FileList'
import { PromptEditor } from './components/PromptEditor'
import { DiffViewer } from './components/DiffViewer'
import { CodeEditorTabs } from './components/CodeEditorTabs'
import { RepoProvider } from './hooks/useRepoContext'

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100vh',
  display: 'flex',
  flexDirection: 'row',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  backgroundColor: '#f0f0f0',
  overflow: 'hidden',
}

const paneStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: '10px',
  overflow: 'auto',
}

function App() {
  const handleTestPreload = () => {
    if (!window.api?.sayHello) {
      alert('Preload API is not available! Make sure you are running inside Electron.')
      return
    }
    window.api.sayHello()
  }

  return (
    <RepoProvider>
      <div style={containerStyle}>
        {/* Pane 1 */}
        <div style={{ ...paneStyle, flexBasis: 300, backgroundColor: '#fafafa', borderRight: '1px solid #ccc' }}>
          <h2>RepoPrompter</h2>
          <p style={{ color: '#666' }}>Select a directory, choose files, build a prompt, then paste AI diffs.</p>
          <button
            onClick={handleTestPreload}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '20px',
            }}
          >
            Test Preload API
          </button>

          <DirectorySelector />
          <FileList />
        </div>

        {/* Pane 2 */}
        <div style={{ ...paneStyle, flex: 1, borderRight: '1px solid #ccc' }}>
          <PromptEditor />
          <DiffViewer />
        </div>

        {/* Pane 3 */}
        <div style={{ ...paneStyle, flexBasis: 400, backgroundColor: '#fff' }}>
          <CodeEditorTabs />
        </div>
      </div>
    </RepoProvider>
  )
}

export default App