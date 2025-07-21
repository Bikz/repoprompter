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

## Current Development Focus: Design System Optimization

**Active Spec**: `.kiro/specs/design-system-optimization/`

The project is currently undergoing a comprehensive design system optimization to consolidate styling approaches, eliminate redundant CSS, and create a unified Tailwind-based design system. The Modal component implementation has been completed, and the focus is now on fixing undefined CSS classes and final cleanup.

### Completed Tasks
- ✅ Optimized design tokens in `src/renderer/styles/design-tokens.css` with simplified spacing, color, and typography scales
- ✅ Created unified Input component with consistent styling variants, focus states, and error handling
- ✅ Refactored Button component to use Tailwind classes with design tokens
- ✅ Updated Card component with optimized glass-surface styling
- ✅ Created unified Modal component with proper positioning, backdrop, and responsive behavior
- ✅ Updated PromptModal to use new unified Modal and Button components (replacing legacy CSS classes)

### Next Priority Tasks
1. **Fix Undefined CSS Classes** (Task 7): Replace undefined Tailwind classes throughout the codebase:
   - `text-title-md` → `text-lg` (6 locations: App.tsx, Card.tsx, PromptEditor.tsx, CodeEditorTabs.tsx, DiffViewer.tsx)
   - `duration-fast` → `duration-150` (Button.tsx, Input.tsx)
   - `ease-smooth` → `ease-out` (Button.tsx, Input.tsx)

2. **CSS Cleanup** (Task 8): Remove redundant styles from `tailwind.css` and consolidate remaining styles

3. **Accessibility & Performance** (Tasks 9-11): Add focus states, test theme switching, and optimize performance

### Design System Architecture
- **Tailwind-First**: All components should use Tailwind utilities with CSS custom properties
- **Design Tokens**: CSS variables in `:root` for theming (spacing, colors, typography, transitions)
- **Glass Morphism**: Apple-inspired glass surface styling with backdrop blur
- **Component Composition**: Reusable UI components in `src/renderer/components/ui/`
- **Modal System**: Unified Modal component with sub-components (ModalHeader, ModalBody, ModalFooter) and anchored positioning support

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

## Known Issues & Technical Debt

### Undefined CSS Classes (Priority Fix Needed)
The following undefined Tailwind classes are currently used and need replacement:
- `text-title-md` → Use `text-lg` (found in 6 locations: App.tsx, Card.tsx, PromptEditor.tsx, CodeEditorTabs.tsx, DiffViewer.tsx)
- `duration-fast` → Use `duration-150` (found in Button.tsx and Input.tsx)
- `ease-smooth` → Use `ease-out` (found in Button.tsx and Input.tsx)

### Modal Component Implementation
The unified Modal component has been successfully implemented with:
- **Core Modal**: Main modal with backdrop, escape key handling, focus management
- **Sub-components**: ModalHeader, ModalBody, ModalFooter for better composition
- **Size variants**: sm, md, lg with responsive behavior
- **Accessibility**: Proper ARIA labels, focus management, keyboard navigation
- **Anchored Modal**: Special variant for positioning relative to elements (used in PromptModal)
- **Features**: Backdrop click to close, escape key handling, scroll prevention

The PromptModal has been successfully migrated to use the new unified Modal component, eliminating the legacy CSS classes (`btn-sm`, `btn-primary`, `btn-secondary`) and replacing them with the unified Button component.
- ✅ Button component: Unified with proper variants and Tailwind classes (but has undefined transition classes)
- ✅ Card component: Updated with glass-surface styling (but uses undefined `text-title-md`)
- ✅ Input component: Created with consistent styling variants, focus states, and error handling (but has undefined transition classes)
- ✅ Modal component: Created unified Modal with ModalHeader, ModalBody, ModalFooter sub-components
- ✅ PromptModal migration: Updated to use new unified Modal and Button components
- ❌ CSS cleanup: Remove redundant styles from tailwind.css
- ❌ Fix undefined CSS classes: Replace `text-title-md`, `duration-fast`, `ease-smooth` throughout codebase

## Conventions

### Code Style

-   TypeScript with strict type checking enabled.
-   React 19 functional components with Hooks.
-   Async/await is used for all asynchronous operations.
-   No path aliases are configured; use relative paths for imports (e.g., `../common/types`).
-   File tree visualization uses `react-arborist` for performance with large repositories.

### Design System Conventions

-   **Styling**: Tailwind CSS with CSS custom properties for theming
-   **Components**: Use unified UI components from `src/renderer/components/ui/` (Button, Card, Input)
-   **Design Tokens**: Reference CSS variables (e.g., `var(--space-4)`, `var(--color-primary)`)
-   **Glass Morphism**: Use `.glass-surface` and `.glass-button` classes for Apple-inspired styling
-   **Transitions**: Use standard Tailwind duration classes (`duration-150`, `duration-300`) instead of custom `duration-fast`
-   **Typography**: Use standard Tailwind text size classes (`text-sm`, `text-base`, `text-lg`) instead of custom `text-title-md`
-   **Legacy Classes**: Replace old CSS classes (`btn-sm`, `btn-primary`, `btn-secondary`) with unified Button component

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
│  │  │  ├─ PromptEditor.tsx      # Textarea for instructions and "Copy" buttons
│  │  │  ├─ DiffViewer.tsx        # Textarea for pasting AI diff
│  │  │  ├─ CodeEditorTabs.tsx    # Tabbed view to preview and accept/reject changes
│  │  │  ├─ PromptModal.tsx       # Modal dialog for naming file groups
│  │  │  └─ ui/                   # Unified UI component library
│  │  │     ├─ Button.tsx         # Unified button with variants (primary, secondary, danger, ghost)
│  │  │     └─ Card.tsx           # Glass-surface card with Header, Body, Footer
│  │  ├─ styles/                 # Design system styles
│  │  │  └─ design-tokens.css     # CSS custom properties for theming
│  │  ├─ utils/
│  │  │  └─ cn.ts                 # Utility for conditional className merging
│  │  └─ hooks/
│  │     └─ useRepoContext.tsx    # Global React context hook for all application state
│
└─ release/                      # Output directory for packaged app (generated by `pnpm dist`)