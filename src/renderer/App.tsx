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
        <header className="draggable flex items-center justify-between bg-brand-blue dark:bg-gray-900 text-white pl-20 pr-6 py-3 shadow border-b border-gray-200 dark:border-gray-800">
          <div className="flex-1">
            <h1 className="text-xl font-bold">RepoPrompter</h1>
            <p className="text-xs text-gray-200 mt-0.5">
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
          <div className="w-72 flex flex-col bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
              <DirectorySelector />
            </div>
          </div>

          {/* MIDDLE COLUMN */}
          <div className="flex-1 flex flex-col bg-white dark:bg-off-black border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
            <section className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-blue-600 dark:text-blue-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Prompt Editor</h2>
              </div>
              <PromptEditor />
            </section>

            <section className="flex-shrink-0 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-green-600 dark:text-green-400">
                    <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Diff Viewer</h2>
              </div>
              <DiffViewer />
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-1/3 bg-white dark:bg-off-black overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-purple-600 dark:text-purple-400">
                    <polyline points="4 7 4 4 20 4 20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="9" y1="20" x2="15" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Code Preview</h2>
              </div>
            </div>
            <div className="p-4">
              <CodeEditorTabs />
            </div>
          </div>
        </main>
      </div>
    </RepoProvider>
  )
}

export default App