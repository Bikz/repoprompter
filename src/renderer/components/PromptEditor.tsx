import React, { useState } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'
import { getTokenInfo } from '../../common/tokenUtils'

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
        updateFileTokens(filePath, content)
      }
    })
    
    let result = ''
    
    if (includeXmlInstructions) {
      result += '<system_instructions>\n' + xmlSystemPrompt.trim() + '\n</system_instructions>\n\n'
    }
    
    result += '<file_map>\n'
    selectedFiles.forEach(file => {
      result += `File: ${file}\n\`\`\`\n${fileContentMap[file] || '// File not available'}\n\`\`\`\n\n`
    })
    result += '</file_map>\n\n'
    result += `<user_instructions>\n${userInstructions}\n</user_instructions>\n`
    return result
  }

  const handleCopy = async () => {
    try {
      const prompt = await buildPrompt(false)
      setCombinedPrompt(prompt)
      await navigator.clipboard.writeText(prompt)
      alert('Prompt copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy prompt:', err)
      alert('Failed to copy prompt. See console for details.')
    }
  }

  const handleCopyWithXml = async () => {
    try {
      const prompt = await buildPrompt(true)
      setCombinedPrompt(prompt)
      await navigator.clipboard.writeText(prompt)
      alert('Prompt with XML instructions copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy prompt:', err)
      alert('Failed to copy prompt. See console for details.')
    }
  }

  const handleViewCombinedPrompt = async () => {
    if (!showCombinedPrompt) {
      const prompt = await buildPrompt(true)
      setCombinedPrompt(prompt)
    }
    setShowCombinedPrompt(!showCombinedPrompt)
  }

  return (
    <div className="flex flex-col gap-2 text-sm text-gray-800 dark:text-white">
      <textarea
        className="w-full h-72 border border-gray-300 dark:border-gray-800 rounded p-2 bg-white dark:bg-off-black text-gray-800 dark:text-white"
        placeholder="Type your instructions here..."
        value={userInstructions}
        onChange={e => setUserInstructions(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="btn btn-success"
        >
          Copy
        </button>
        <button
          onClick={handleCopyWithXml}
          className="btn btn-primary"
        >
          Copy with XML
        </button>
        <button
          onClick={handleViewCombinedPrompt}
          className="btn btn-secondary"
        >
          {showCombinedPrompt ? 'Hide' : 'View'} combined prompt
        </button>
      </div>

      {showCombinedPrompt && combinedPrompt && (
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            className="w-full h-40 border border-gray-300 dark:border-gray-800 rounded p-2 bg-white dark:bg-off-black text-gray-800 dark:text-white text-sm"
            value={combinedPrompt}
            readOnly
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This is the generated prompt with XML instructions. Use the buttons above to copy it again.
          </p>
        </div>
      )}
    </div>
  )
}