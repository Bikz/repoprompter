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

## Current Development Focus: Electron-Puppeteer Integration

**Active Spec**: `.kiro/specs/electron-puppeteer-integration/`

Following the successful completion of the design system optimization, the project is now actively implementing Puppeteer integration for enhanced debugging capabilities. This feature will enable programmatic control of the Electron app, console log extraction, automated testing, and seamless debugging workflows.

**Previous Completed**: Design System Optimization ✅ - All 11 tasks completed with unified Tailwind-based design system.

**Current Status**: All tasks are **PENDING** - ready to begin implementation of the Electron-Puppeteer integration.

### 🎯 Electron-Puppeteer Integration Requirements

The new integration will provide comprehensive debugging capabilities through Chrome DevTools Protocol (CDP):

1. **CDP Connection** - Enable remote debugging in development mode with automatic endpoint exposure
2. **Console Log Extraction** - Capture all console messages (log, error, warn, info) with timestamps and formatting
3. **Screenshot Capture** - Take full-page and element-specific screenshots in PNG/JPEG formats
4. **User Interaction Automation** - Programmatically click buttons, input text, and navigate the interface
5. **CLI Debug Tool** - Simple command-line interface for quick debugging operations
6. **Development Workflow Integration** - Seamless integration without impacting normal app usage
7. **Shareable Debug Sessions** - Export logs, screenshots, and interaction history in multiple formats

### 📋 Implementation Progress

**All Tasks Currently Pending** - ⏳ **READY TO START**
- Task 1: Configure Electron for remote debugging (CDP setup, security configuration)
- Task 2: Create Puppeteer debug script with CDP connection logic
- Task 3: Implement log extraction and formatting with timestamps
- Task 4: Add screenshot functionality with window state handling
- Task 5: Create convenient package scripts (dev:debug, debug:capture, etc.)
- Task 6: Test and validate the integration across all scenarios

**Next Priority:** Task 1 - Configure Electron main process for remote debugging with proper security constraints

### ✅ Design System Optimization - COMPLETED
All 11 tasks completed with 8.2% CSS bundle reduction and unified component system.

### Key Achievements
- **Unified Design System**: All components now use consistent Tailwind utilities with CSS custom properties
- **Performance Optimized**: CSS bundle reduced by 8.2% with improved loading performance
- **Accessibility Compliant**: Proper focus states, ARIA labels, and high contrast mode support
- **Theme Consistency**: Smooth light/dark mode transitions across all components
- **Component Library**: Complete set of reusable UI components (Button, Input, Card, Modal)

### Design System Architecture
- **Tailwind-First**: All components use Tailwind utilities with CSS custom properties
- **Design Tokens**: CSS variables in `:root` for theming (spacing, colors, typography, transitions)
- **Glass Morphism**: Apple-inspired glass surface styling with backdrop blur
- **Component Composition**: Reusable UI components in `src/renderer/components/ui/`
- **Modal System**: Unified Modal component with sub-components (ModalHeader, ModalBody, ModalFooter) and anchored positioning support
- **Component Composition**: Reusable UI components in `src/renderer/components/ui/`
- **Modal System**: Unified Modal component with sub-components (ModalHeader, ModalBody, ModalFooter) and anchored positioning support

## Commands

### Core Development
-   **Development**: `pnpm dev` - Starts Electron with HMR for the renderer.
-   **Debug Mode**: `pnpm dev:debug` - Starts Electron with remote debugging enabled (CDP on port 9222)
-   **Build**: `pnpm build` - Compiles and bundles all code into the `dist` directory.
-   **Distribution**: `pnpm dist` - Creates platform-specific installers from the `dist` output.
-   **Clean**: `pnpm clean` - Removes the `dist` directory.

### Debugging & Testing
-   **Debug Capture**: `pnpm debug:capture` - Connects to running Electron app and captures logs/screenshots
-   **Logs Only**: `pnpm debug:logs` - Extracts console logs from running app
-   **Screenshot**: `pnpm debug:screenshot` - Takes screenshot of current app state
-   **Lint**: `pnpm lint` - Runs ESLint to check for code quality issues.
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

## Recent Changes & Current State

### Electron-Puppeteer Integration - IN PROGRESS
The project is now implementing comprehensive debugging capabilities through Puppeteer integration. **Requirements have been recently updated and expanded** to include more detailed acceptance criteria for each feature:

#### 🔧 **Architecture Overview**
- **CDP Endpoint**: Chrome DevTools Protocol exposed on port 9222 in development mode
- **Debug Script**: Standalone Node.js script (`debug-electron.js`) for connecting to running Electron app
- **CLI Interface**: Command-line tools for log extraction, screenshots, and automation
- **Output Formats**: JSON, HTML reports, and plain text for easy sharing with AI assistants

#### 📋 **Implementation Components**
- **Main Process Changes**: Enable remote debugging with `--remote-debugging-port=9222` flag in development mode only
- **Console Log Capture**: Real-time capture of all console messages with timestamps, log levels, and stack traces
- **Screenshot System**: Full-page and element-specific capture with configurable formats (PNG/JPEG)
- **Automation Framework**: User interaction simulation including file selection, button clicks, and text input
- **CLI Debug Tool**: Standalone script with commands for log extraction, screenshots, and basic automation
- **Export System**: Structured debug session exports in JSON, HTML, and plain text formats

#### 🛡️ **Security & Performance**
- Remote debugging only enabled in development mode
- CDP endpoint bound to localhost only
- Minimal performance impact on running application
- Automatic cleanup of debug files with configurable retention

### Development Environment Configuration
- **VS Code Settings**: Project uses Peacock extension with purple theme (`#4a39b8`) for visual workspace identification
- **Color Customizations**: Consistent purple branding across VS Code UI elements (activity bar, status bar, title bar)
- **Development Experience**: Optimized for TypeScript/React development with Electron
- **Editor Configuration**: Standard VS Code settings for consistent development experience

### Design System Implementation - COMPLETED ✅
The comprehensive design system optimization has been **successfully completed** with all 11 tasks finished:

#### ✅ **Performance Achievements**
- **CSS Bundle Optimization**: Reduced from 39.95 KB to 36.68 KB (8.2% reduction)
- **Design Token Consolidation**: Streamlined CSS custom properties for better performance
- **Tailwind Configuration**: Optimized with safelist and disabled unused plugins

#### ✅ **Component Library Status**
- **Button Component**: Unified with proper variants (primary, secondary, danger, ghost, success) and consistent Tailwind classes
- **Input Component**: Created with variants (default, search), error states, and proper focus handling
- **Card Component**: Updated with optimized glass-surface styling and consistent spacing
- **Modal Component**: Complete unified system with ModalHeader, ModalBody, ModalFooter sub-components
- **PromptModal**: Successfully migrated to use new unified Modal and Button components

#### ✅ **System Improvements**
- **CSS Cleanup**: Removed all redundant styles and undefined CSS classes
- **Accessibility**: Enhanced focus states, ARIA labels, and high contrast mode support
- **Theme System**: Verified smooth light/dark mode transitions across all components
- **Performance**: Optimized transitions, backdrop filters, and CSS bundle size

## Conventions

### Code Style

-   TypeScript with strict type checking enabled.
-   React 19 functional components with Hooks.
-   Async/await is used for all asynchronous operations.
-   Path aliases are configured in `tsconfig.json`: `@/*`, `@renderer/*`, `@common/*` for clean imports.
-   File tree visualization uses `react-arborist` for performance with large repositories.

### Current TypeScript Issues
-   Some React type declarations may be missing (React 19 types not fully resolved)
-   Button component properly extends `React.ButtonHTMLAttributes` for onClick support
-   Modal components use proper TypeScript interfaces with required children props

### Design System Conventions

-   **Styling**: Tailwind CSS with CSS custom properties for theming
-   **Components**: Use unified UI components from `src/renderer/components/ui/` (Button, Card, Input, Modal)
-   **Design Tokens**: Reference CSS variables (e.g., `var(--space-4)`, `var(--color-primary)`)
-   **Glass Morphism**: Use `.glass-surface` and `.glass-button` classes for Apple-inspired styling
-   **Transitions**: Use standard Tailwind duration classes (`duration-150`, `duration-300`)
-   **Typography**: Use standard Tailwind text size classes (`text-sm`, `text-base`, `text-lg`)
-   **Component Composition**: Modal uses sub-components (ModalHeader, ModalBody, ModalFooter) for better structure

### AI Interaction Formats

-   **Prompt Format**: The app generates a prompt with a `<file_map>` containing all selected files, followed by `<user_instructions>`.
-   **Diff Format**: The AI must respond with an XML structure. Each file to be changed must be in its own `<file>` tag: `<file name="path/to/file.ext"><replace>...new content...</replace></file>`. The root element can be `<root>` or omitted.

### Debugging Integration

-   **Debug Output**: Console logs, screenshots, and interaction history can be exported in JSON, HTML, or plain text formats for sharing with AI assistants
-   **CDP Connection**: Development mode exposes Chrome DevTools Protocol on port 9222 for external tool integration
-   **Automated Testing**: Puppeteer scripts can simulate user interactions for consistent bug reproduction

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