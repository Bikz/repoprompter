import React, { useEffect, useState } from 'react'
import { DirectorySelector } from './components/DirectorySelector'
import { FileList } from './components/FileList'
import { PromptEditor } from './components/PromptEditor'
import { DiffViewer } from './components/DiffViewer'
import { CodeEditorTabs } from './components/CodeEditorTabs'
import { RepoProvider } from './hooks/useRepoContext'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Toggle the "dark" class on the document’s root element
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <RepoProvider>
      <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-off-black text-gray-800 dark:text-gray-100">
        {/* Top Header */}
        <header className="flex items-center justify-between bg-brand-blue dark:bg-blue-900 text-white p-4 shadow">
          <div>
            <h1 className="text-2xl font-bold">RepoPrompter</h1>
            <p className="text-sm text-gray-200 mt-1">
              Select a directory, choose files, build a prompt, then paste AI diffs for quick code updates.
            </p>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="btn btn-secondary"
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 overflow-hidden">
          {/* LEFT COLUMN: Directory + FileList */}
          <div className="w-64 flex flex-col bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
            <DirectorySelector />
            <div className="mt-4 flex-1 overflow-auto">
              <FileList />
            </div>
          </div>

          {/* MIDDLE COLUMN: Prompt & Diff Tools */}
          <div className="flex-1 flex flex-col bg-white dark:bg-off-black p-4 overflow-auto border-r border-gray-200 dark:border-gray-700">
            <section className="flex-shrink-0 mb-6">
              <h2 className="text-xl font-semibold mb-2">Prompt Editor</h2>
              <PromptEditor />
            </section>
            <section className="flex-shrink-0">
              <h2 className="text-xl font-semibold mb-2">Diff Viewer</h2>
              <DiffViewer />
            </section>
          </div>

          {/* RIGHT COLUMN: Code Diff Preview */}
          <div className="w-1/3 bg-white dark:bg-off-black p-4 overflow-auto">
            <h2 className="text-xl font-semibold mb-2">Code Diff Preview</h2>
            <CodeEditorTabs />
          </div>
        </main>
      </div>
    </RepoProvider>
  )
}

export default App