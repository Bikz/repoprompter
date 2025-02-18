/**
 * diffParser.ts
 * Parse the XML diff and apply changes to local files
 * This is a simplified example that looks for <file name="..."> <replace> ... 
 */

import { writeFileContent, readFileContent } from './fileSystem'
import path from 'path'
import * as xmldoc from 'xmldoc' // `pnpm add xmldoc` or any XML parser you prefer

interface DiffSegment {
  fileName: string
  newContent: string
}

/**
 * Parse the XML and return an array of file changes (fileName, newContent).
 * Implementation logic depends on the structure you design for the XML.
 */
export function parseDiffXml(xmlString: string): DiffSegment[] {
  // Guard against empty or null strings
  if (!xmlString?.trim()) {
    console.warn('parseDiffXml called with empty XML string.')
    // Return empty array or throw a custom error
    return []
  }

  const doc = new xmldoc.XmlDocument(xmlString)
  const fileNodes = doc.childrenNamed('file')
  const changes: DiffSegment[] = []

  fileNodes.forEach(fileNode => {
    const fileName = fileNode.attr.name
    const replaceNode = fileNode.childNamed('replace')
    if (fileName && replaceNode) {
      changes.push({
        fileName,
        newContent: replaceNode.val || '',
      })
    }
  })

  return changes
}

/**
 * Apply the patches read from the XML onto the local file system
 * Overwrites the old content with the new content for each file
 */
export async function applyDiffPatches(basePath: string, xmlString: string) {
  const changes = parseDiffXml(xmlString)
  changes.forEach(change => {
    // Just overwrite the file with the new content
    const currentContent = readFileContent(basePath, change.fileName)
    const updatedContent = change.newContent
    // In real usage, you'd do a line-by-line patch or merge
    // For simplicity, we just overwrite:
    writeFileContent(basePath, change.fileName, updatedContent)

    console.log(`Applied patch to ${change.fileName}`)
    console.log('Old content length:', currentContent.length)
    console.log('New content length:', updatedContent.length)
  })
}