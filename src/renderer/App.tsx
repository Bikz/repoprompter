import React, { useEffect, useState } from 'react'
import { DirectorySelector } from './components/DirectorySelector'
import { PromptEditor } from './components/PromptEditor'
import { DiffViewer } from './components/DiffViewer'
import { CodeEditorTabs } from './components/CodeEditorTabs'
import { RepoProvider } from './hooks/useRepoContext'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Toggle the "dark" class on the root element
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <RepoProvider>
      {/* Full screen so we don't scroll at the page level */}
      <div className="h-screen overflow-hidden flex flex-col font-sans bg-white dark:bg-off-black text-gray-800 dark:text-white">
        {/* Top header bar */}
        <header className="draggable flex items-center justify-between bg-brand-blue dark:bg-off-black text-white p-4 shadow">
          <div>
            <h1 className="text-2xl font-bold">RepoPrompter</h1>
            <p className="text-sm text-gray-200 mt-1">
              Select a directory, choose files, build a prompt, then paste AI diffs for quick code updates.
            </p>
          </div>

          {/* Toggle Dark/Light */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="btn btn-secondary no-drag"
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </header>

        {/* Main 3-column layout */}
        <main className="flex flex-1 overflow-hidden">
          {/* LEFT COLUMN: Directory selector and file list */}
          <div className="w-64 flex flex-col bg-gray-50 dark:bg-off-black border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto">
            <DirectorySelector />
          </div>

          {/* MIDDLE COLUMN */}
          <div className="flex-1 flex flex-col bg-white dark:bg-off-black p-4 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
            <section className="flex-shrink-0 mb-6">
              <h2 className="text-xl font-semibold mb-2">Prompt Editor</h2>
              <PromptEditor />
            </section>

            <section className="flex-shrink-0">
              <h2 className="text-xl font-semibold mb-2">Diff Viewer</h2>
              <DiffViewer />
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-1/3 bg-white dark:bg-off-black p-4 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-2">Code Diff Preview</h2>
            <CodeEditorTabs />
          </div>
        </main>
      </div>
    </RepoProvider>
  )
}

export default App