import React, { useState } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'

export function PromptEditor() {
  const { baseDir, selectedFiles } = useRepoContext()
  const [userInstructions, setUserInstructions] = useState('')
  const [combinedPrompt, setCombinedPrompt] = useState('')
  const [showCombinedPrompt, setShowCombinedPrompt] = useState(false)

  const systemPrompt = `
You are a code editing assistant. You can only reply with XML according to the instructions below:
1) Use the exact XML formatting structure with <file> tags, etc.
2) No additional text outside of XML.
3) Do not wrap output in <![CDATA[ ]].
4) Provide changes as needed.
`

  async function buildFullPrompt() {
    const fileContentMap: Record<string, string> = {}
    for (const file of selectedFiles) {
      const content = await window.api.readFileContents(baseDir, file)
      fileContentMap[file] = content
    }

    let result = '<system_instructions>\n' + systemPrompt.trim() + '\n</system_instructions>\n\n'
    result += '<file_map>\n'
    selectedFiles.forEach(file => {
      result += `File: ${file}\n\`\`\`\n${fileContentMap[file]}\n\`\`\`\n\n`
    })
    result += '</file_map>\n\n'
    result += `<user_instructions>\n${userInstructions}\n</user_instructions>\n`
    return result
  }

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

  const handleViewCombinedPrompt = async () => {
    if (!showCombinedPrompt) {
      const prompt = await buildFullPrompt()
      setCombinedPrompt(prompt)
    }
    setShowCombinedPrompt(!showCombinedPrompt)
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        className="w-full h-24 border border-gray-300 rounded p-2 text-sm"
        placeholder="Type your instructions here..."
        value={userInstructions}
        onChange={e => setUserInstructions(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={handleGenerateAndCopyPrompt}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
        >
          Generate &amp; Copy Prompt
        </button>
        <button
          onClick={handleViewCombinedPrompt}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
        >
          {showCombinedPrompt ? 'Hide' : 'View'} combined prompt
        </button>
      </div>

      {showCombinedPrompt && combinedPrompt && (
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            className="w-full h-40 border border-gray-300 rounded p-2 text-sm"
            value={combinedPrompt}
            readOnly
          />
          <p className="text-xs text-gray-500">
            This is the generated prompt. Use the "Generate &amp; Copy Prompt" button to copy it again if needed.
          </p>
        </div>
      )}
    </div>
  )
}