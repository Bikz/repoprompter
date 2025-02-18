/**
 * fileSystem.ts
 * Helper functions for reading/writing file contents
 */

import fs from 'fs'
import path from 'path'

/**
 * Synchronously reads the entire directory tree (recursively)
 * and returns a list of file paths relative to basePath.
 */
export function getAllFilePaths(basePath: string): string[] {
  const filePaths: string[] = []

  function readDirRecursive(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(currentPath, entry.name)
      if (entry.isDirectory()) {
        readDirRecursive(full)
      } else {
        filePaths.push(path.relative(basePath, full))
      }
    }
  }

  readDirRecursive(basePath)
  return filePaths
}

/** Read file contents (UTF-8) by base + relative path */
export function readFileContent(basePath: string, relativeFile: string): string {
  const full = path.join(basePath, relativeFile)
  return fs.readFileSync(full, 'utf-8')
}

/** Write updated contents to file */
export function writeFileContent(basePath: string, relativeFile: string, newContent: string) {
  const full = path.join(basePath, relativeFile)
  fs.writeFileSync(full, newContent, 'utf-8')
}