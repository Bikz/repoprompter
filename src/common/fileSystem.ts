/**
 * File: fileSystem.ts
 * Description: Helper functions for reading and writing file contents synchronously.
 * Also includes a simple recursive function to gather all file paths.
 */

import fs from 'fs'
import path from 'path'

/**
 * Recursively scans a directory, collecting file paths relative to basePath.
 * Returns an array of string file paths.
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

/** Read file content (UTF-8) given base path + relative path. */
export function readFileContent(basePath: string, relativeFile: string): string {
  const full = path.join(basePath, relativeFile)
  return fs.readFileSync(full, 'utf-8')
}

/** Write new content (UTF-8) to a file. Creates or overwrites the file. */
export function writeFileContent(basePath: string, relativeFile: string, newContent: string) {
  const full = path.join(basePath, relativeFile)
  fs.writeFileSync(full, newContent, 'utf-8')
}