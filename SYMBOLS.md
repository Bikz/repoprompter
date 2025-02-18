# SYMBOLS.md

This document explains key symbols/modules in the RepoPrompter project:

- **`api`** (window.api in renderer):
  - `selectDirectory()`: Opens a system dialog to pick a folder.
  - `readDirectory(dirPath: string)`: Returns an array of relative file paths.
  - `readFileContents(baseDir: string, file: string)`: Returns the contents of a file.
  - `applyXmlDiff(basePath: string, xmlString: string)`: Applies the AI-generated XML diff.
  - (Optional) We could add a single-file write if partial acceptance is needed.

- **`RepoProvider` / `useRepoContext`**:
  - Global React context that stores:
    - `baseDir`: The selected directory path.
    - `fileList`: All files in the selected directory (recursively).
    - `selectedFiles`: A list of files that user wants to include in the prompt.
    - `diffChanges`: An array of file changes parsed from the XML diff.
    - Methods for toggling selection, parsing diffs, accepting/rejecting diffs, etc.

- **`DirectorySelector.tsx`**:
  - Button to open a directory. Once chosen, sets `baseDir` and `fileList`.

- **`FileList.tsx`**:
  - Displays all `fileList` items. Allows toggling which files are `selectedFiles`.

- **`PromptEditor.tsx`**:
  - Textarea for user instructions.
  - Button to generate the combined prompt with file contents + instructions.

- **`DiffViewer.tsx`**:
  - Textarea to paste AI’s XML diff.
  - “Preview” button calls `parseDiffXml(...)` to store changes in context.
  - Optionally “Apply Diff” to apply everything at once.

- **`CodeEditorTabs.tsx` (New)**:
  - A Monaco‐like code editor with tabs for each changed file from the diff.
  - Allows user to “Accept” or “Reject” each file individually.
  - “Accept All” button applies all changes in one go.

- **`fileSystem.ts`**:
  - Utility functions for reading/writing local files from the main process.

- **`diffParser.ts`**:
  - Functions to parse the XML diff and write new content.  
  - Uses the `xmldoc` library for XML parsing.

- **`promptBuilder.ts`**:
  - Helper that merges selected file contents and the user instructions into a single prompt.