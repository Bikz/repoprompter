### SYMBOLS.md

This document explains key symbols, components, and modules in the RepoPrompter project.

-   **`window.api` (exposed via `preload.ts`)**: The secure bridge between the Renderer and Main processes.
    -   `selectDirectory()`: Opens a system dialog to pick a folder.
    -   `readDirectory(dirPath: string)`: Returns an array of relative file paths within a directory, applying global ignore patterns.
    -   `readFileContents(baseDir, file)`: Returns the string contents of a single file.
    -   `readMultipleFileContents(baseDir, files[])`: Batch-reads multiple files, returning a map of file paths to their contents.
    -   `parseXmlDiff(xmlString)`: Parses an XML string into a structured list of file changes.
    -   `applyXmlDiff(basePath, xmlString)`: Securely applies the AI-generated XML diff to local files.
    -   `loadRepoSettings(repoPath)`: Loads settings (groups, instructions) for a specific repo path.
    -   `updateRepoSettings(repoPath, updates)`: Saves updated settings for a repo.
    -   `getKnownLargeFiles()` / `setKnownLargeFiles(list)`: Manages the global list of files to be flagged as large.

-   **`configStore.ts` (main process)**:
    -   Manages the `settings.json` file in the user's data directory.
    -   Stores global settings and per-repository settings (like user instructions and file groups).
    -   **Note**: This service currently reads from the disk on every call, which is inefficient. It should be refactored to use an in-memory cache that is written to disk on change.

-   **`RepoProvider` / `useRepoContext` (React context)**:
    -   The central state management hub for the React application.
    -   **Responsibilities**:
        -   `baseDir`: The currently selected repository path.
        -   `fileList`: All discoverable files in `baseDir`.
        -   `selectedFiles`: An array of user-selected file paths for the prompt.
        -   `diffChanges`: Parsed file changes from the AI's XML diff.
        -   `groups`: Manages saved file selections.
        -   `fileTokens`: A map of file paths to their estimated token counts.
        -   Methods for all user actions: toggling selection, managing groups, applying diffs, etc.
    -   **Note**: This context is a "God Object" and should be refactored into smaller, more focused contexts (e.g., `FileContext`, `DiffContext`).

-   **`DirectorySelector.tsx`**:
    -   Renders the "Open Repo" button and manages the list of "File Groups".
    -   Initiates directory scanning and file list population.

-   **`FileList.tsx`**:
    -   Uses `react-arborist` to display a virtualized file tree.
    -   Handles file/folder selection and displays token information.

-   **`PromptEditor.tsx`**:
    -   Provides a textarea for user instructions.
    -   Includes buttons to build and copy the final prompt to the clipboard.

-   **`DiffViewer.tsx`**:
    -   Textarea to paste the AI’s XML diff.
    -   "Preview Diff" button parses the XML and populates the `CodeEditorTabs`.
    -   "Apply Diff" button applies the *entire* raw diff to the filesystem.

-   **`CodeEditorTabs.tsx`**:
    -   Displays a tab for each file found in the parsed diff.
    -   Shows the proposed new content in a simple `<pre>` block (not a full code editor).
    -   Provides "Accept" and "Reject" buttons for each file.
    -   **Note**: This should be enhanced to show a rich, colored diff view instead of just the new content.

-   **`common/` Directory**: Contains TypeScript modules shared between the Main and Renderer processes.
    -   `fileSystem.ts`: Low-level, promise-based `fs` wrappers.
    -   `diffParser.ts`: Secure XML parsing and patch application logic.
    -   `promptBuilder.ts`: Logic for constructing the final prompt string.
    -   `tokenUtils.ts`: Fast, estimation-based token counting and formatting utilities.
    -   `types.ts`: Shared TypeScript interfaces for the API, config, and state.