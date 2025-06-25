/**
 * File: types.ts
 * Description: Holds shared TypeScript interfaces for file changes, config, and the FileSystemApi.
 */

export interface FileChange {
  fileName: string
  newContent: string
}

/** Represents a named group of files for a particular repo (e.g., 'UI Files'). */
export interface RepoGroup {
  name: string
  files: string[]
}

/** Settings stored per repo: user instructions and file groups. */
export interface RepoSettings {
  userInstructions: string
  groups: RepoGroup[]
}

/** Response shape from loading repo settings via IPC. */
export interface LoadRepoSettingsResponse {
  success: boolean
  settings?: RepoSettings
  error?: string
}

/** Response shape from updating repo settings via IPC. */
export interface UpdateRepoSettingsResponse {
  success: boolean
  error?: string
}

/** Response shape from retrieving known large files. */
export interface KnownLargeFilesResponse {
  success: boolean
  list?: string[]
  error?: string
}

/** Response shape from retrieving ignore patterns. */
export interface IgnorePatternsResponse {
  success: boolean
  list?: string[]
  error?: string
}

/**
 * The FileSystemApi is exposed in the renderer as `window.api`, providing a
 * restricted set of methods for reading directories/files, parsing diffs,
 * applying diffs, and now for config access as well.
 */
export interface FileSystemApi {
  /** Demo function just for logging. */
  sayHello: () => void

  /** Directory selection dialog. */
  selectDirectory: () => Promise<string | undefined>

  /** Recursively read all files in a directory, returning an array of relative paths. */
  readDirectory: (dirPath: string) => Promise<string[]>

  /** Read an individual file’s text contents. */
  readFileContents: (baseDir: string, relativeFilePath: string) => Promise<string>

  /** Optionally parse an XML diff into FileChange objects. */
  parseXmlDiff?: (xmlString: string) => Promise<FileChange[]>

  /**
   * Apply the given XML diff to local files, returning { success, error }.
   * This calls parseDiffXml internally and writes new content to disk.
   */
  applyXmlDiff: (basePath: string, xmlString: string) => Promise<{ success: boolean; error?: string }>

  /** Batch read multiple files at once; returns an object mapping filenames -> contents and any errors. */
  readMultipleFileContents: (baseDir: string, files: string[]) => Promise<{ contents: Record<string, string>; errors: string[] }>

  /**
   * Config-related IPC calls, for loading/updating per-repo settings and global large-file lists.
   */
  loadRepoSettings: (repoPath: string) => Promise<LoadRepoSettingsResponse>
  updateRepoSettings: (repoPath: string, updates: Partial<RepoSettings>) => Promise<UpdateRepoSettingsResponse>
  getKnownLargeFiles: () => Promise<KnownLargeFilesResponse>
  setKnownLargeFiles: (newList: string[]) => Promise<KnownLargeFilesResponse>
  getIgnorePatterns: () => Promise<IgnorePatternsResponse>
  setIgnorePatterns: (newList: string[]) => Promise<IgnorePatternsResponse>
}

declare global {
  interface Window {
    api: FileSystemApi
  }
}