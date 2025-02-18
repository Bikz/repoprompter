import React, { useState } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'

export function PromptEditor() {
  const { baseDir, selectedFiles } = useRepoContext()
  const [userInstructions, setUserInstructions] = useState('')
  const [combinedPrompt, setCombinedPrompt] = useState('')
  const [showCombinedPrompt, setShowCombinedPrompt] = useState(false)

  // A system prompt that instructs the model to reply in XML
  const systemPrompt = `
You are a code editing assistant. You can only reply with XML according to the instructions below:
1) Use the exact XML formatting structure with <file> tags, etc.
2) No additional text outside of XML.
3) Do not wrap output in <![CDATA[ ]].
4) Provide changes as needed.
`

  /**
   * Helper to gather file contents, build the full prompt string
   * including system prompt, file_map, and user_instructions.
   */
  async function buildFullPrompt() {
    // Gather file contents
    const fileContentMap: Record<string, string> = {}
    for (const file of selectedFiles) {
      const content = await window.api.readFileContents(baseDir, file)
      fileContentMap[file] = content
    }

    // Construct final prompt
    let result = '<system_instructions>\n' + systemPrompt.trim() + '\n</system_instructions>\n\n'
    result += '<file_map>\n'
    selectedFiles.forEach(file => {
      result += `File: ${file}\n\`\`\`\n${fileContentMap[file]}\n\`\`\`\n\n`
    })
    result += '</file_map>\n\n'
    result += `<user_instructions>\n${userInstructions}\n</user_instructions>\n`

    return result
  }

  /**
   * Generates the combined prompt and copies it to clipboard.
   */
  const handleGenerateAndCopyPrompt = async () => {
    try {
      const prompt = await buildFullPrompt()
      setCombinedPrompt(prompt)
      await navigator.clipboard.writeText(prompt)
      alert('Prompt copied to clipboard!')
    } catch (err) {
      console.error('Failed to generate or copy prompt:', err)
      alert('Failed to generate or copy prompt. See console for details.')
    }
  }

  /**
   * Builds the combined prompt, sets state, and toggles its display (no copy).
   */
  const handleViewCombinedPrompt = async () => {
    if (!showCombinedPrompt) {
      const prompt = await buildFullPrompt()
      setCombinedPrompt(prompt)
    }
    setShowCombinedPrompt(!showCombinedPrompt)
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Prompt Editor</h3>
      <textarea
        style={{ width: '100%', height: 300 }}
        placeholder="Type your instructions here..."
        value={userInstructions}
        onChange={e => setUserInstructions(e.target.value)}
      />
      <div style={{ marginTop: 8 }}>
        {/* Generate & Copy Prompt button */}
        <button
          onClick={handleGenerateAndCopyPrompt}
          style={{
            padding: '6px 12px',
            background: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            marginRight: 8,
          }}
        >
          📋 Generate &amp; Copy Prompt
        </button>

        {/* View/hide combined prompt button */}
        <button
          onClick={handleViewCombinedPrompt}
          style={{
            padding: '6px 12px',
            background: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          {showCombinedPrompt ? 'Hide' : 'View'} combined prompt
        </button>
      </div>

      {/* Conditionally show combined prompt */}
      {showCombinedPrompt && combinedPrompt && (
        <div style={{ marginTop: 16 }}>
          <h4>Combined Prompt</h4>
          <textarea
            style={{ width: '100%', height: 150 }}
            value={combinedPrompt}
            readOnly
          />
          <p style={{ fontSize: '0.9em', color: '#888' }}>
            This is the generated prompt. Use the "Generate &amp; Copy Prompt" button to copy it again if needed.
          </p>
        </div>
      )}
    </div>
  )
}