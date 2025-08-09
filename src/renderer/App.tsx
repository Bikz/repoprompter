import React, { useEffect, useState } from 'react'
import { DirectorySelector } from './components/DirectorySelector'
import { PromptEditor } from './components/PromptEditor'
import { DiffViewer } from './components/DiffViewer'
import { CodeEditorTabs } from './components/CodeEditorTabs'
import { RepoProvider } from './hooks/useRepoContext'
import { Button } from './components/ui/Button'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check system preference on mount
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkMode(prefersDark)
  }, [])

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
      {/* Full screen container with gradient background */}
      <div className="h-screen overflow-hidden flex flex-col font-sans bg-substrate">
        
        {/* Modern glass header */}
        <header className="draggable glass-surface border-b border-surface backdrop-blur-lg z-10">
          <div className="flex items-center justify-between px-6 h-14">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-primary">RepoPrompter</h1>
              <span className="text-xs text-secondary">Build AI prompts from your codebase</span>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2 no-drag">
              <Button
                onClick={() => setIsDarkMode(!isDarkMode)}
                variant="ghost"
                size="sm"
                className="gap-1.5"
              >
                {isDarkMode ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Main 3-column layout */}
        <div className="flex-1 flex overflow-hidden p-2 gap-2">
          {/* Sidebar: Repository & Files */}
          <aside className="w-80 flex flex-col gap-2">
            <DirectorySelector />
          </aside>

          {/* Middle: Context Hub */}
          <main className="flex-1 flex flex-col gap-2 min-w-0">
            <PromptEditor />
            <DiffViewer />
          </main>

          {/* Right: Code Preview */}
          <aside className="w-96 flex flex-col">
            <CodeEditorTabs />
          </aside>
        </div>
      </div>
    </RepoProvider>
  )
}

export default App