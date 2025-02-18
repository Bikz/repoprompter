# SYMBOLS.md

This document explains key symbols/modules in the RepoPrompter project:

- **`api`** (window.api in renderer):
  - `selectDirectory()`: Opens a system dialog to pick a folder.
  - `readDirectory(dirPath: string)`: Returns an array of relative file paths.
  - `readFileContents(baseDir: string, file: string)`: Returns the contents of a file.
  - `applyXmlDiff(basePath: string, xmlString: string)`: Applies the AI-generated XML diff.

- **`RepoProvider`** / **`useRepoContext`**:
  - Global React context that stores:
    - `baseDir`: The selected directory path.
    - `fileList`: All files in the selected directory (recursively).
    - `selectedFiles`: A list of files that user wants to include in the prompt.
    - Methods for toggling selection, etc.

- **`DirectorySelector.tsx`**:
  - Button to open a directory. Once chosen, sets `baseDir` and `fileList`.

- **`FileList.tsx`**:
  - Displays all `fileList` items. Allows toggling which files are `selectedFiles`.

- **`PromptEditor.tsx`**:
  - Textarea for user instructions.
  - Button to generate the combined prompt with file contents + instructions.

- **`DiffViewer.tsx`**:
  - Textarea to paste AI's XML diff.
  - Preview changes (parse client-side).
  - Apply changes (invokes `applyXmlDiff`).

- **`fileSystem.ts`**:
  - Utility functions for reading/writing local files from the main process.

- **`diffParser.ts`**:
  - Functions to parse the XML diff and write new content.  
  - Uses the `xmldoc` library for XML parsing.

- **`promptBuilder.ts`**:
  - Helper that merges selected file contents and the user instructions into a single prompt.