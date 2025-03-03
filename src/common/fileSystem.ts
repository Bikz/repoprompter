import fs from 'fs'
import path from 'path'

/**
 * Recursively scans a directory, collecting file paths relative to basePath.
 * Returns an array of string file paths asynchronously.
 */
export async function getAllFilePaths(basePath: string): Promise<string[]> {
  const filePaths: string[] = []

  async function readDirRecursive(currentPath: string) {
    const entries = await fs.promises.readdir(currentPath, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(currentPath, entry.name)
      if (entry.isDirectory()) {
        await readDirRecursive(full)
      } else {
        filePaths.push(path.relative(basePath, full))
      }
    }
  }

  await readDirRecursive(basePath)
  return filePaths
}

/** Read file content (UTF-8) given base path + relative path, asynchronously. */
export async function readFileContent(basePath: string, relativeFile: string): Promise<string> {
  const full = path.join(basePath, relativeFile)
  return fs.promises.readFile(full, 'utf-8')
}

/** Write new content (UTF-8) to a file asynchronously. Creates or overwrites the file. */
export async function writeFileContent(basePath: string, relativeFile: string, newContent: string): Promise<void> {
  const full = path.join(basePath, relativeFile)
  await fs.promises.writeFile(full, newContent, 'utf-8')
}