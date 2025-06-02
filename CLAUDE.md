# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## RepoPrompter Overview

RepoPrompter is an Electron desktop application that bridges local codebases with AI assistants. It allows developers to:

1. Select files from their local Git repositories
2. Generate structured prompts containing those files' contents
3. Send these prompts to AI models (like Claude)
4. Receive XML-formatted code changes back
5. Preview and apply those changes directly to their local files

## Commands

- **Development**: `pnpm dev` - Starts Electron with HMR
- **Build**: `pnpm build` - Compiles TypeScript and bundles
- **Distribution**: `pnpm dist` - Creates platform installers
- **Lint**: `pnpm lint` - Runs ESLint
- **Clean**: `pnpm clean` - Removes build artifacts
- **Preview**: `pnpm preview` - Preview production build

## Architecture

### Process Model
- **Main Process** (`src/main/`): File system operations, window management, IPC handlers
- **Renderer Process** (`src/renderer/`): React UI with TypeScript/Tailwind
- **Preload** (`src/main/preload.ts`): Secure bridge exposing `window.api`

### State Management
- Central `RepoContext` (no Redux) manages all app state via React Context
- Persistent settings stored in OS userData directory via `configStore.ts`

### Key Components
- **App.tsx**: 3-column layout orchestrator
- **DirectorySelector/FileList**: Repository browsing and file selection
- **PromptEditor**: Generates AI prompts from selected files
- **DiffViewer**: Parses and previews XML diffs
- **CodeEditorTabs**: Displays file contents with syntax highlighting

### IPC Communication
Main process handlers in `main.ts`:
- `select-directory`: Opens directory picker
- `read-directory-recursive`: Gets file tree
- `read-file-content`: Reads single file
- `read-multiple-files`: Batch file reading
- `write-file-content`: Applies changes
- `load-repo-settings`/`update-repo-settings`: Settings persistence

## Conventions

### Code Style
- TypeScript with strict checking
- React functional components + hooks
- Async/await for all async operations
- Path aliases: `@/` → `src/`, `@renderer/` → `src/renderer/`, `@common/` → `src/common/`

### AI Integration
- **Prompt Format**: system_instructions → file_map → user_instructions
- **Diff Format**: `<file name="path"><replace>new content</replace></file>`
- XML parsing expects exact format - validate before applying

### UI Patterns
- Apple-style window with `titleBarStyle: 'hiddenInset'`
- Dark mode support throughout
- Modal positioning uses button refs
- File tree auto-expands first level

## Development Tips

### Testing Changes
1. Run `pnpm dev` to start with HMR
2. Main process changes require restart
3. Renderer changes hot-reload automatically
4. Check DevTools console for errors

### Common Tasks
- **Add new IPC handler**: Define in `main.ts`, expose in `preload.ts`, add type in `preload.ts`
- **New component**: Place in `src/renderer/components/`, use Tailwind classes
- **Modify file operations**: Update both `main.ts` handler and `fileSystem.ts` types

### Security Notes
- All file paths are validated against directory traversal
- Renderer has no direct file system access
- Context isolation enabled - use IPC for all Node.js operations

Current Features

  1. Repository Browsing
    - Directory picker to select any local folder
    - File tree view with expandable folders
    - Smart filtering (excludes .git, node_modules, hidden files)
    - First-level folders auto-expand
  2. File Selection
    - Multi-select files via checkboxes
    - File groups (save/load named selections)
    - Group management (create, activate, remove)
    - Per-repository settings persistence
  3. Prompt Generation
    - Structured format: system instructions → file map → user instructions
    - Copy prompt to clipboard
    - Shows selected files with their full contents
  4. Diff Processing
    - Parses XML-formatted diffs from AI responses
    - Side-by-side diff preview with syntax highlighting
    - Apply changes to local files
    - Validates XML format before applying
  5. Code Viewing
    - Tabbed interface for viewing multiple files
    - Syntax highlighting
    - Shows file paths and content
  6. UI/UX
    - 3-column layout (file browser | prompt/diff | code viewer)
    - Dark mode support
    - Apple-style window design
    - Modal dialogs for user input