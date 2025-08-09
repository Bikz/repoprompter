import { writeFileContent } from './fileSystem'
import xmldoc from 'xmldoc'
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
  
  let doc: xmldoc.XmlDocument
  try {
    doc = new xmldoc.XmlDocument(xmlString)
  } catch (error) {
    throw new Error(`Invalid XML format: ${error}`)
  }
  
  // Validate root element structure
  if (!doc.name || (doc.name !== 'root' && doc.childrenNamed('file').length === 0)) {
    throw new Error('Invalid XML structure: Expected root element with <file> children or direct <file> elements')
  }
  
  const fileNodes = doc.childrenNamed('file')
  if (fileNodes.length === 0) {
    throw new Error('No <file> elements found in XML diff')
  }
  
  const changes: DiffSegment[] = []
  const seenFiles = new Set<string>()

  fileNodes.forEach((fileNode: any, index: number) => {
    const fileName = fileNode.attr.name
    if (!fileName) {
      throw new Error(`File element at index ${index} is missing 'name' attribute`)
    }
    
    if (seenFiles.has(fileName)) {
      throw new Error(`Duplicate file found in diff: ${fileName}`)
    }
    seenFiles.add(fileName)
    
    const replaceNode = fileNode.childNamed('replace')
    if (!replaceNode) {
      throw new Error(`File '${fileName}' is missing <replace> element`)
    }
    
    // Validate file path
    if (fileName.includes('..') || fileName.startsWith('/') || fileName.includes('\\..\\')) {
      throw new Error(`Invalid file path (potential path traversal): ${fileName}`)
    }
    
    changes.push({
      fileName,
      newContent: replaceNode.val || '',
    })
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