# Project Structure

## Root Directory Organization

```
├── src/                    # Source code
├── dist/                   # Build output (generated)
├── release/                # Distribution packages (generated)
├── electron/               # Electron-specific assets
├── public/                 # Static assets for renderer
├── .kiro/                  # Kiro IDE configuration
└── node_modules/           # Dependencies (generated)
```

## Source Code Structure (`src/`)

### Main Process (`src/main/`)
- `main.ts` - Electron main process entry point, window management, IPC handlers
- `preload.ts` - Preload script for secure renderer-main communication
- `configStore.ts` - Configuration management and file system utilities

### Renderer Process (`src/renderer/`)
- `App.tsx` - Root React component with three-column layout
- `AppSimple.tsx` - Alternative simplified layout
- `index.tsx` - React app entry point
- `index.html` - HTML template
- `tailwind.css` - Tailwind imports and custom styles

### Components (`src/renderer/components/`)
- `DirectorySelector.tsx` - File tree and directory selection
- `PromptEditor.tsx` - Prompt building and editing interface
- `DiffViewer.tsx` - XML diff parsing and preview
- `CodeEditorTabs.tsx` - Code preview with syntax highlighting
- `FileList.tsx` - File selection management
- `ui/` - Reusable UI components (Button, Card, etc.)

### State Management (`src/renderer/contexts/`)
- `FileSelectionContext.tsx` - Selected files state
- `DiffContext.tsx` - Diff parsing and application state
- `TokenContext.tsx` - Token counting and estimation
- `GroupSettingsContext.tsx` - File groups and repo settings
- `ContextComposer.tsx` - Context provider composition

### Shared Code (`src/common/`)
- `types.ts` - TypeScript interfaces shared between main/renderer
- `diffParser.ts` - XML diff parsing logic
- `fileSystem.ts` - File system utilities
- `promptBuilder.ts` - Prompt generation logic
- `tokenUtils.ts` - Token counting utilities

## Configuration Files

### Build & Development
- `electron.vite.config.ts` - Electron-vite configuration with path aliases
- `vite.config.ts` - Vite configuration for renderer process
- `tsconfig.json` - TypeScript configuration with strict mode
- `tailwind.config.cjs` - Tailwind CSS with custom design tokens

### Package Management
- `package.json` - Dependencies, scripts, and Electron builder config
- `pnpm-lock.yaml` - Lockfile for reproducible installs

## Design System

### Styling Architecture
- `src/renderer/styles/design-tokens.css` - CSS custom properties for theming
- Tailwind classes use CSS variables for dynamic light/dark mode
- Component-specific styles co-located with components

### Path Aliases
- `@/` → `src/`
- `@renderer/` → `src/renderer/`
- `@common/` → `src/common/`

## File Naming Conventions
- **Components**: PascalCase (e.g., `DirectorySelector.tsx`)
- **Utilities**: camelCase (e.g., `tokenUtils.ts`)
- **Types**: camelCase with descriptive names (e.g., `FileSystemApi`)
- **Contexts**: PascalCase ending in "Context" (e.g., `DiffContext.tsx`)

## Build Output Structure (`dist/`)
```
dist/
├── main/           # Main process build
├── preload/        # Preload script build
└── renderer/       # Renderer process build
```

## Key Architectural Principles
- **Separation of Concerns**: Main process handles file system, renderer handles UI
- **Type Safety**: Shared interfaces prevent main/renderer communication errors
- **Context Composition**: Multiple contexts composed for clean state management
- **Component Isolation**: Each major feature has its own component and context