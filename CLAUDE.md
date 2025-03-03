# RepoPrompter Development Guide

## Commands
- Build: `pnpm build`
- Development: `pnpm dev`
- Distribution: `pnpm dist`
- Lint: `pnpm lint`
- Clean: `pnpm clean`
- Preview: `pnpm preview`

## Code Style
- TypeScript with strict type checking
- React functional components with hooks
- State management via context (useRepoContext)
- Tailwind CSS for styling
- Path aliases: `@/*` → `src/*`, `@renderer/*` → `src/renderer/*`, `@common/*` → `src/common/*`

## Project Structure
- `/src/common/`: Shared types and utilities
- `/src/main/`: Electron main process
- `/src/renderer/`: React UI components and hooks
- Electron/React 19/TypeScript/Vite/Tailwind CSS stack

## Conventions
- Clear file/function naming (descriptive, camelCase for functions, PascalCase for components)
- Error handling with try/catch blocks
- Async/await for async operations
- Structured prompt format for AI: system_instructions, file_map, user_instructions
- XML-based diff format for AI communication