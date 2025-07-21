import React, { useState } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'
import { Card, CardBody } from './ui/Card'
import { Button } from './ui/Button'

export function DiffViewer() {
  const { baseDir, applyFullDiff, setDiffXmlAndParse } = useRepoContext()
  const [xmlDiff, setXmlDiff] = useState('')
  const [isParsing, setIsParsing] = useState(false)

  const handlePreviewDiff = async () => {
    if (!xmlDiff.trim() || !baseDir) {
      alert('Please paste a diff and select a repository first')
      return
    }

    setIsParsing(true)
    try {
      await setDiffXmlAndParse(xmlDiff)
    } catch (error) {
      console.error('Error parsing diff:', error)
      alert(`Error parsing diff: ${error}`)
    } finally {
      setIsParsing(false)
    }
  }

  const handleApplyDiff = async () => {
    if (!xmlDiff.trim() || !baseDir) {
      alert('Please paste a diff and select a repository first')
      return
    }

    try {
      await applyFullDiff(xmlDiff)
      setXmlDiff('') // Clear after successful apply
      
      // Show success feedback
      const button = document.querySelector('#apply-button') as HTMLButtonElement
      if (button) {
        const originalText = button.textContent
        button.textContent = '✓ Applied!'
        button.classList.add('bg-success')
        setTimeout(() => {
          button.textContent = originalText
          button.classList.remove('bg-success')
        }, 2000)
      }
    } catch (error) {
      console.error('Error applying diff:', error)
      alert(`Error applying diff: ${error}`)
    }
  }

  const hasContent = xmlDiff.trim().length > 0

  return (
    <Card className="flex-1">
      <CardBody className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-primary">Diff Viewer</h2>
          </div>
          
          {hasContent && (
            <span className="text-sm text-secondary">
              {xmlDiff.length} characters
            </span>
          )}
        </div>

        <div className="flex-1 min-h-0">
          <textarea
            value={xmlDiff}
            onChange={(e) => setXmlDiff(e.target.value)}
            placeholder="Paste AI's XML diff here..."
            className="w-full h-full p-4 bg-black/5 dark:bg-white/5 border border-surface rounded-lg 
                     text-primary placeholder-tertiary resize-none focus:outline-none 
                     focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm"
            disabled={!baseDir}
          />
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            onClick={handlePreviewDiff}
            variant="warning"
            disabled={!hasContent || !baseDir || isParsing}
            className="flex-1"
          >
            {isParsing ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Parsing...
              </>
            ) : (
              'Preview Diff'
            )}
          </Button>
          <Button
            id="apply-button"
            onClick={handleApplyDiff}
            variant="danger"
            disabled={!hasContent || !baseDir}
            className="flex-1"
          >
            Apply Diff
          </Button>
        </div>

        {!baseDir && (
          <div className="mt-4 p-3 bg-warning/10 rounded-lg">
            <p className="text-sm text-warning">
              Please select a repository first to enable diff operations.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  )
}