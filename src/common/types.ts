export interface FileChange {
  fileName: string
  newContent: string
}

export interface FileSystemApi {
  sayHello: () => void
  selectDirectory: () => Promise<string | undefined>
  readDirectory: (dirPath: string) => Promise<string[]>
  readFileContents: (baseDir: string, relativeFilePath: string) => Promise<string>
  parseXmlDiff?: (xmlString: string) => Promise<FileChange[]>
  applyXmlDiff: (basePath: string, xmlString: string) => Promise<{ success: boolean; error?: string }>
}

declare global {
  interface Window {
    api: FileSystemApi
  }
}