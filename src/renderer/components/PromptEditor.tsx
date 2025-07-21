import React, { useState } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'
import { getTokenInfo } from '../../common/tokenUtils'
import { Card, CardBody } from './ui/Card'
import { Button } from './ui/Button'

export function PromptEditor() {
  const { baseDir, selectedFiles, updateFileTokens } = useRepoContext()
  const [userInstructions, setUserInstructions] = useState('')
  const [combinedPrompt, setCombinedPrompt] = useState('')
  const [showCombinedPrompt, setShowCombinedPrompt] = useState(false)

  const xmlSystemPrompt = `
You are a code editing assistant. You must respond with XML-formatted diffs for code changes.

Instructions:
1. Analyze the provided code files and user instructions
2. Return ONLY XML output with your proposed changes
3. Use this exact format for each file change:

<file name="path/to/file.ext">
<replace>
new content here
</replace>
</file>

4. Include the complete updated content in the <replace> section
5. Do not include any text outside of the XML structure
6. Do not wrap output in <![CDATA[ ]]
7. Multiple files can be included, each in its own <file> tag
`

  async function buildPrompt(includeXmlInstructions: boolean) {
    const { contents: fileContentMap, errors } = await window.api.readMultipleFileContents(baseDir, selectedFiles)
    
    if (errors.length > 0) {
      alert(`Warning: Some files could not be loaded:\n${errors.join('\n')}`)
    }
    
    // Calculate and cache token counts for all loaded files
    Object.entries(fileContentMap).forEach(([filePath, content]) => {
      if (content && !content.startsWith('// File too large') && !content.startsWith('// Error reading file')) {
        const tokenInfo = getTokenInfo(content)
        updateFileTokens(filePath, tokenInfo.tokenCount)
      }
    })
    
    let combinedContent = ''
    
    if (includeXmlInstructions) {
      combinedContent += xmlSystemPrompt + '\n\n'
    }
    
    combinedContent += '<file_map>\n'
    
    Object.entries(fileContentMap).forEach(([filePath, content]) => {
      combinedContent += `<file name="${filePath}">\n${content}\n</file>\n\n`
    })
    
    combinedContent += '</file_map>\n\n'
    combinedContent += `<user_instructions>\n${userInstructions}\n</user_instructions>`
    
    return combinedContent
  }

  const handleCopy = async () => {
    const prompt = await buildPrompt(false)
    navigator.clipboard.writeText(prompt)
    const button = document.querySelector('#copy-button') as HTMLButtonElement
    if (button) {
      const originalText = button.textContent
      button.textContent = '✓ Copied!'
      button.classList.add('bg-success')
      setTimeout(() => {
        button.textContent = originalText
        button.classList.remove('bg-success')
      }, 2000)
    }
  }

  const handleCopyWithXML = async () => {
    const prompt = await buildPrompt(true)
    navigator.clipboard.writeText(prompt)
    const button = document.querySelector('#copy-xml-button') as HTMLButtonElement
    if (button) {
      const originalText = button.textContent
      button.textContent = '✓ Copied!'
      button.classList.add('bg-success')
      setTimeout(() => {
        button.textContent = originalText
        button.classList.remove('bg-success')
      }, 2000)
    }
  }

  const handleViewCombined = async () => {
    const prompt = await buildPrompt(true)
    setCombinedPrompt(prompt)
    setShowCombinedPrompt(true)
  }

  const totalTokens = Object.values(useRepoContext().fileTokens).reduce((sum, count) => sum + count, 0)
  const hasSelectedFiles = selectedFiles.length > 0

  return (
    <Card className="h-[50%]">
      <CardBody className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-primary">Prompt Editor</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-secondary">
              {selectedFiles.length} files • {totalTokens.toLocaleString()} tokens
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <textarea
            value={userInstructions}
            onChange={(e) => setUserInstructions(e.target.value)}
            placeholder="Type your instructions here..."
            className="w-full h-full p-4 bg-black/5 dark:bg-white/5 border border-surface rounded-lg 
                     text-primary placeholder-tertiary resize-none focus:outline-none 
                     focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm"
            disabled={!hasSelectedFiles}
          />
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            id="copy-button"
            onClick={handleCopy}
            variant="primary"
            disabled={!hasSelectedFiles || !userInstructions.trim()}
            className="flex-1"
          >
            Copy
          </Button>
          <Button
            id="copy-xml-button"
            onClick={handleCopyWithXML}
            variant="secondary"
            disabled={!hasSelectedFiles || !userInstructions.trim()}
            className="flex-1"
          >
            Copy with XML
          </Button>
          <Button
            onClick={handleViewCombined}
            variant="ghost"
            disabled={!hasSelectedFiles || !userInstructions.trim()}
          >
            View combined prompt
          </Button>
        </div>

        {/* Combined Prompt Modal */}
        {showCombinedPrompt && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full max-h-[80vh] flex flex-col">
              <CardBody className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Combined Prompt</h3>
                  <Button
                    onClick={() => setShowCombinedPrompt(false)}
                    variant="ghost"
                    size="sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
                <textarea
                  value={combinedPrompt}
                  readOnly
                  className="flex-1 w-full p-4 bg-black/5 dark:bg-white/5 border border-surface rounded-lg 
                           text-primary font-mono text-sm resize-none focus:outline-none"
                />
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(combinedPrompt)
                      setShowCombinedPrompt(false)
                    }}
                    variant="primary"
                  >
                    Copy & Close
                  </Button>
                  <Button
                    onClick={() => setShowCombinedPrompt(false)}
                    variant="secondary"
                  >
                    Close
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </CardBody>
    </Card>
  )
}