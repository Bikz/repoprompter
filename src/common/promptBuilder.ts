/**
 * promptBuilder.ts
 * Combines selected file contents + user instructions into one big string
 */

export function buildPrompt({
    basePath,
    selectedFiles,
    userInstructions,
    fileContentMap,
  }: {
    basePath: string
    selectedFiles: string[]
    userInstructions: string
    fileContentMap: Record<string, string>
  }): string {
    // Basic approach: gather contents, then append instructions
    let prompt = '<file_map>\n'
    selectedFiles.forEach(file => {
      const content = fileContentMap[file]
      prompt += `File: ${file}\n\`\`\`\n${content}\n\`\`\`\n\n`
    })
    prompt += '</file_map>\n\n'
    prompt += `<user_instructions>\n${userInstructions}\n</user_instructions>\n`
    return prompt
  }