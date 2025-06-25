---

### **`CLAUDE.md`**

This file provides guidance to Claude when working with code in this repository.

## RepoPrompter Overview

RepoPrompter is an Electron desktop application that bridges local codebases with AI assistants. It allows developers to:

1.  Select files from their local repositories.
2.  Generate structured prompts containing the files' contents.
3.  Send these prompts to AI models like Claude.
4.  Receive XML-formatted code changes back.
5.  Preview and apply those changes directly to their local files.

## Commands

-   **Development**: `pnpm dev` - Starts Electron with HMR for the renderer.
-   **Build**: `pnpm build` - Compiles and bundles all code into the `dist` directory.
-   **Distribution**: `pnpm dist` - Creates platform-specific installers from the `dist` output.
-   **Lint**: `pnpm lint` - Runs ESLint to check for code quality issues.
-   **Clean**: `pnpm clean` - Removes the `dist` directory.
-   **Preview**: `pnpm preview` - Runs the production build locally.

## Architecture

### Process Model

-   **Main Process** (`src/main/`): Node.js environment. Handles file system operations, window management, configuration, and all IPC logic.
-   **Renderer Process** (`src/renderer/`): Chromium environment. Renders the UI using React, TypeScript, and Tailwind CSS.
-   **Preload Script** (`src/main/preload.ts`): Securely exposes a limited `window.api` object to the Renderer process using `contextBridge`.

### State Management

-   A central `RepoContext` (`useRepoContext.tsx`) manages all UI state via the React Context API.
-   Persistent settings (file groups, instructions) are stored in a JSON file in the OS's user data directory, managed by `configStore.ts`.

### Key Components

-   **App.tsx**: The root component, sets up the 3-column layout.
-   **DirectorySelector.tsx / FileList.tsx**: Handles repository browsing and file selection.
-   **PromptEditor.tsx**: Generates the final AI prompt from the selected files and user instructions.
-   **DiffViewer.tsx**: Parses and initiates the preview of the AI's XML diff.
-   **CodeEditorTabs.tsx**: Displays proposed file changes for user review and approval.

### IPC Communication

All backend operations are requested via `window.api` and handled in `main.ts`:

-   `dialog:selectDirectory`
-   `fs:readDirectory`
-   `fs:readFile`
-   `fs:readMultipleFiles`
-   `fs:parseXmlDiff`
-   `fs:applyXmlDiff`
-   `config:loadRepoSettings`
-   `config:updateRepoSettings`
-   `config:getKnownLargeFiles`
-   `config:setKnownLargeFiles`

## Conventions

### Code Style

-   TypeScript with strict type checking enabled.
-   React functional components with Hooks.
-   Async/await is used for all asynchronous operations.
-   No path aliases are configured; use relative paths for imports (e.g., `../common/types`).

### AI Interaction Formats

-   **Prompt Format**: The app generates a prompt with a `<file_map>` containing all selected files, followed by `<user_instructions>`.
-   **Diff Format**: The AI must respond with an XML structure. Each file to be changed must be in its own `<file>` tag: `<file name="path/to/file.ext"><replace>...new content...</replace></file>`. The root element can be `<root>` or omitted.

### Security

-   The Renderer process has **no direct file system access**. All FS operations must go through the IPC bridge.
-   `contextIsolation` is enabled for security.
-   All file paths in incoming diffs are validated in `diffParser.ts` and `applyDiffPatches` to prevent path traversal attacks.

---

### FILE STRUCTURE

```
repoprompter/
├─ .gitignore
├─ package.json
├─ pnpm-lock.yaml
├─ postcss.config.cjs
├─ tailwind.config.cjs
├─ tsconfig.json
├─ tsconfig.node.json
├─ electron.vite.config.ts
├─ vite.config.ts
│
├─ src/
│  ├─ main/                      # Electron Main Process
│  │  ├─ main.ts                 # App entry (creates BrowserWindow, sets up IPC)
│  │  ├─ preload.ts              # Exposes secure `window.api` to the renderer
│  │  └─ configStore.ts          # Manages settings.json for repos & global settings
│  │
│  ├─ common/                    # Shared logic (isomorphic TypeScript)
│  │  ├─ diffParser.ts           # Parse & apply XML diffs
│  │  ├─ fileSystem.ts           # Low-level filesystem wrappers
│  │  ├─ promptBuilder.ts        # Helper to combine user instructions + file content
│  │  ├─ tokenUtils.ts           # Utilities for estimating and formatting token counts
│  │  └─ types.ts                # Shared TypeScript interfaces for API, config, state
│  │
│  ├─ renderer/                  # React Frontend (Renderer Process)
│  │  ├─ index.html              # HTML entry point
│  │  ├─ index.tsx               # React root entry point
│  │  ├─ tailwind.css            # Tailwind base CSS and directives
│  │  ├─ App.tsx                 # Main React App component (3-column layout)
│  │  ├─ components/             # Reusable UI components
│  │  │  ├─ DirectorySelector.tsx # "Open Repo" button and File Groups management
│  │  │  ├─ FileList.tsx          # Virtualized file tree using react-arborist
│  │  │  ├─ FileTreeNode.tsx      # (DEPRECATED - Should be removed)
│  │  │  ├─ PromptEditor.tsx      # Textarea for instructions and "Copy" buttons
│  │  │  ├─ DiffViewer.tsx        # Textarea for pasting AI diff
│  │  │  ├─ CodeEditorTabs.tsx    # Tabbed view to preview and accept/reject changes
│  │  │  └─ PromptModal.tsx       # Modal dialog for naming file groups
│  │  └─ hooks/
│  │     └─ useRepoContext.tsx    # Global React context hook for all application state
│
└─ release/                      # Output directory for packaged app (generated by `pnpm dist`)