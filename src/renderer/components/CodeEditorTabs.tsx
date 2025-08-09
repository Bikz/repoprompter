import React, { useState, useEffect } from 'react'
import * as Diff from 'diff'
import * as Diff2Html from 'diff2html'
import 'diff2html/bundles/css/diff2html.min.css'
import { useRepoContext } from '../hooks/useRepoContext'
import { Card, CardBody } from './ui/Card'
import { Button } from './ui/Button'

export function CodeEditorTabs() {
  const {
    diffChanges,
    acceptAllDiffs,
    acceptSingleDiff,
    rejectSingleDiff,
    getOriginalFileContent
  } = useRepoContext()
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [diffHtml, setDiffHtml] = useState('')

  // When a new set of diffs is loaded, default to the first file
  useEffect(() => {
    if (diffChanges.length > 0) {
      setActiveTab(diffChanges[0].fileName)
    } else {
      setActiveTab(null)
    }
  }, [diffChanges])

  useEffect(() => {
    const generateDiff = async () => {
      if (!activeTab) {
        setDiffHtml('')
        return
      }

      const change = diffChanges.find(c => c.fileName === activeTab)
      if (!change) {
        setDiffHtml('')
        return
      }

      const original = await getOriginalFileContent(change.fileName)
      const patch = createTwoFilesPatch(
        change.fileName,
        change.fileName,
        original || '',
        change.newContent || ''
      )
      const html = Diff2Html.html(patch, {
        inputFormat: 'diff',
        outputFormat: 'side-by-side',
        showFiles: false
      })
      setDiffHtml(html)
    }

    generateDiff()
  }, [activeTab, diffChanges, getOriginalFileContent])

  if (diffChanges.length === 0) {
    return (
      <Card className="h-full">
        <CardBody className="p-6 h-full flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h3 className="text-lg font-semibold text-primary mb-2">Code Preview</h3>
            <p className="text-sm text-secondary">
              No changes to display. Paste AI diff to see updates here.
            </p>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      {/* Header with tabs */}
      <div className="flex-shrink-0 border-b border-surface">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-primary">Code Preview</h2>
          </div>
          
          <Button
            onClick={acceptAllDiffs}
            variant="success"
            size="sm"
            disabled={diffChanges.length === 0}
          >
            Accept All
          </Button>
        </div>

        {/* File tabs */}
        <div className="flex gap-1 px-4 pb-2 overflow-x-auto">
          {diffChanges.map((change) => (
            <button
              key={change.fileName}
              onClick={() => setActiveTab(change.fileName)}
              className={`px-3 py-1.5 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === change.fileName 
                  ? 'bg-surface text-primary border-b-2 border-primary' 
                  : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'
                }`}
            >
              {change.fileName.split('/').pop()}
              {change.status === 'accepted' && (
                <span className="ml-2 text-success">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Diff content */}
      <CardBody className="flex-1 overflow-hidden p-0">
        {activeTab && (
          <div className="h-full flex flex-col">
            {/* Action buttons for current file */}
            <div className="flex gap-2 p-4 border-b border-surface bg-black/5 dark:bg-white/5">
              <Button
                onClick={() => acceptSingleDiff(activeTab)}
                variant="success"
                size="sm"
                className="flex-1"
              >
                Accept Changes
              </Button>
              <Button
                onClick={() => rejectSingleDiff(activeTab)}
                variant="danger"
                size="sm"
                className="flex-1"
              >
                Reject Changes
              </Button>
            </div>

            {/* Diff viewer */}
            <div 
              className="flex-1 overflow-auto p-4 diff-viewer"
              dangerouslySetInnerHTML={{ __html: diffHtml }}
            />
          </div>
        )}
      </CardBody>
    </Card>
  )
}

// Add custom styles for the diff viewer
const style = document.createElement('style')
style.textContent = `
  .diff-viewer .d2h-wrapper {
    font-family: var(--font-mono);
    font-size: 13px;
  }
  
  .diff-viewer .d2h-file-header {
    display: none;
  }
  
  .diff-viewer .d2h-code-side-line {
    background: transparent;
  }
  
  .diff-viewer .d2h-del {
    background-color: rgba(255, 59, 48, 0.15);
  }
  
  .diff-viewer .d2h-ins {
    background-color: rgba(50, 215, 75, 0.15);
  }
  
  .dark .diff-viewer .d2h-code-linenumber,
  .dark .diff-viewer .d2h-code-side-linenumber {
    background-color: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.4);
  }
`
document.head.appendChild(style)