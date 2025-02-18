/**
 * PromptEditor.tsx
 * User types instructions, we build the combined prompt from selected files
 */

import React, { useState } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'

export function PromptEditor() {
  const { baseDir, selectedFiles } = useRepoContext()
  const [userInstructions, setUserInstructions] = useState('')
  const [combinedPrompt, setCombinedPrompt] = useState('')

  const handleGeneratePrompt = () => {
    // For each selected file, read content from preload
    // Build final prompt string
    const fileContentMap: Record<string, string> = {}
    selectedFiles.forEach(file => {
      fileContentMap[file] = window.api.readFileContents(baseDir, file)
    })
    let result = '<file_map>\n'
    selectedFiles.forEach(file => {
      result += `File: ${file}\n\`\`\`\n${fileContentMap[file]}\n\`\`\`\n\n`
    })
    result += '</file_map>\n\n'
    result += `<user_instructions>\n${userInstructions}\n</user_instructions>\n`
    setCombinedPrompt(result)
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Prompt Editor</h3>
      <textarea
        style={{ width: '100%', height: 80 }}
        placeholder="Type your instructions here..."
        value={userInstructions}
        onChange={e => setUserInstructions(e.target.value)}
      />
      <div style={{ marginTop: 8 }}>
        <button
          onClick={handleGeneratePrompt}
          style={{
            padding: '6px 12px',
            background: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Generate Prompt
        </button>
      </div>

      {combinedPrompt && (
        <div style={{ marginTop: 16 }}>
          <h4>Combined Prompt</h4>
          <textarea
            style={{ width: '100%', height: 150 }}
            value={combinedPrompt}
            readOnly
          />
          <p style={{ fontSize: '0.9em', color: '#888' }}>
            Copy/paste this into ChatGPT
          </p>
        </div>
      )}
    </div>
  )
}