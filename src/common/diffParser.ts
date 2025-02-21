/**
 * File: diffParser.ts
 * Description: Parses the AI-generated XML diff and applies changes to local files.
 * Simplistic approach: looks for <file name="...">, <replace> content.
 */

import { writeFileContent, readFileContent } from './fileSystem'
import path from 'path'
import * as xmldoc from 'xmldoc'

interface DiffSegment {
  fileName: string
  newContent: string
}

/** Parse XML and return an array of file changes (fileName, newContent). */
export function parseDiffXml(xmlString: string): DiffSegment[] {
  if (!xmlString?.trim()) {
    console.warn('parseDiffXml called with empty XML string.')
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

/** Overwrite local files with new content for each DiffSegment. */
export async function applyDiffPatches(basePath: string, xmlString: string) {
  const changes = parseDiffXml(xmlString)
  changes.forEach(change => {
    const currentContent = readFileContent(basePath, change.fileName)
    const updatedContent = change.newContent
    writeFileContent(basePath, change.fileName, updatedContent)

    console.log(`Applied patch to ${change.fileName}`)
    console.log('Old content length:', currentContent.length)
    console.log('New content length:', updatedContent.length)
  })
}