# Technology Stack

## Core Framework
- **Electron** with `electron-vite` for modern build pipeline
- **React 19** with TypeScript and JSX
- **Node.js** backend with IPC communication

## Build System & Package Management
- **Package Manager**: pnpm (required)
- **Build Tool**: electron-vite with Vite for renderer process
- **TypeScript**: Strict mode enabled with path aliases
- **Bundler**: Rollup (via Vite) with separate outputs for main/preload/renderer

## UI & Styling
- **Styling**: Tailwind CSS with custom design tokens
- **Theme System**: CSS variables for light/dark mode switching
- **Components**: Custom UI components in `src/renderer/components/ui/`
- **File Tree**: `react-arborist` for virtualized tree view
- **Icons**: Inline SVG with Heroicons-style patterns

## State Management
- **React Context** for global state (file selection, diff management, repo settings)
- **React Hooks** for local component state
- **IPC Communication** between main and renderer processes

## File Processing
- **Diff Parsing**: Custom XML diff parser with `xmldoc`
- **File System**: Node.js fs with recursive directory reading
- **Large File Handling**: 5MB file size limit with intelligent filtering

## Development & Distribution
- **Auto-updates**: `electron-updater` for production updates
- **Packaging**: `electron-builder` for platform-specific installers
- **Dev Tools**: React DevTools integration in development

## Common Commands

```bash
# Development
pnpm install          # Install dependencies
pnpm dev             # Start development with hot reload
pnpm dev:renderer    # Start only renderer dev server

# Building
pnpm build           # Build for production
pnpm dist            # Create platform installer
pnpm clean           # Clean build artifacts

# Troubleshooting
rm -rf node_modules && rm pnpm-lock.yaml && pnpm install  # Hard reset
pnpm store prune     # Clear pnpm cache
```

## Architecture Patterns
- **Process Separation**: Main process handles file system, renderer handles UI
- **Type Safety**: Shared TypeScript interfaces in `src/common/types.ts`
- **Path Aliases**: `@/`, `@renderer/`, `@common/` for clean imports
- **Context Providers**: Centralized state management with React Context