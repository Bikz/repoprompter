/**
 * File: App.tsx
 * Description: Main React component. Sets up the 3-pane layout for directory, prompt editor, diff viewer, and code editor tabs.
 */

import React from 'react'
import { DirectorySelector } from './components/DirectorySelector'
import { FileList } from './components/FileList'
import { PromptEditor } from './components/PromptEditor'
import { DiffViewer } from './components/DiffViewer'
import { CodeEditorTabs } from './components/CodeEditorTabs'
import { RepoProvider } from './hooks/useRepoContext'

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
      <div className="flex flex-row w-full h-screen overflow-hidden font-sans bg-gray-100">
        {/* LEFT PANE */}
        <div className="w-72 bg-gray-50 border-r border-gray-300 p-4 flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-gray-700">RepoPrompter</h2>
          <p className="text-sm text-gray-500">
            Select a directory, choose files, build a prompt, then paste AI diffs.
          </p>
          <button
            onClick={handleTestPreload}
            className="px-4 py-2 text-sm rounded bg-brand-blue text-white hover:bg-blue-600"
          >
            Test Preload API
          </button>
          <DirectorySelector />
          <div className="flex-1 overflow-auto">
            <FileList />
          </div>
        </div>

        {/* MIDDLE PANE */}
        <div className="flex flex-col flex-1 border-r border-gray-300 p-4 gap-4 overflow-auto">
          <PromptEditor />
          <DiffViewer />
        </div>

        {/* RIGHT PANE */}
        <div className="w-96 bg-white p-4 overflow-auto">
          <CodeEditorTabs />
        </div>
      </div>
    </RepoProvider>
  )
}

export default App