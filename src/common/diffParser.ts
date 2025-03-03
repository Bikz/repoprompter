import { writeFileContent } from './fileSystem'
import * as xmldoc from 'xmldoc'
import path from 'path'

interface DiffSegment {
  fileName: string
  newContent: string
}

/**
 * Parse the XML diff string and return an array of file changes.
 * Looks for <file name="..."><replace>...</replace></file>.
 */
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

/**
 * Overwrite local files with new content for each DiffSegment, asynchronously,
 * validating the file path to prevent path traversal attacks.
 */
export async function applyDiffPatches(basePath: string, xmlString: string) {
  const changes = parseDiffXml(xmlString)
  const baseResolved = path.resolve(basePath)
  for (const change of changes) {
    const fullPath = path.resolve(baseResolved, change.fileName)
    if (!fullPath.startsWith(baseResolved)) {
      throw new Error(`Invalid file path outside of base directory: ${change.fileName}`)
    }
    await writeFileContent(basePath, change.fileName, change.newContent)
    console.log(`Applied patch to ${change.fileName}`)
  }
}