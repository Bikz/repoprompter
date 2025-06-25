# Repoprompter

Repoprompter is a desktop application built with Electron, Vite, and React, designed to streamline the developer workflow of interacting with AI code assistants. It allows developers to easily select files from a local repository, build a comprehensive context-rich prompt, and apply AI-generated code changes directly to their local files.

## Features

-   **Repository Browsing:**
    -   Select any local directory via a native folder picker.
    -   View the entire repository in a collapsible file tree (`react-arborist`).
    -   Automatically filters out noise like `.git`, `node_modules`, and other common unnecessary files.
-   **Intelligent File Selection:**
    -   Select individual files or entire folders with checkboxes.
    -   Create, save, and load "File Groups" to quickly re-select common sets of files.
    -   "Unselect Unnecessary Files" feature to intelligently prune the selection, removing lock files, assets, and configs to optimize AI context.
-   **Prompt Generation:**
    -   Builds a structured prompt containing system instructions, the full content of selected files, and your custom instructions.
    -   Copy the generated prompt to the clipboard with one click.
    -   Displays the total estimated token count for the selected files to help manage context limits.
-   **AI Diff Application:**
    -   Paste an AI-generated XML diff into the Diff Viewer.
    -   Preview the proposed changes for each file in a tabbed interface.
    -   Accept or reject changes on a per-file basis, or accept all at once.
    -   Changes are applied directly to your local files on acceptance.
-   **Modern UI/UX:**
    -   Clean, three-column layout: File Browser | Editors | Code Preview.
    -   Full dark mode support.
    -   Custom Apple-style window with a draggable header.

## Tech Stack

-   **Framework:** Electron with `electron-vite` for a modern build pipeline.
-   **UI:** React 19 with TypeScript, using Hooks and Context for state management.
-   **File Tree:** `react-arborist` for a highly performant and virtualized file tree view.
-   **Styling:** Tailwind CSS for a utility-first design system.
-   **Diff Parsing:** `xmldoc` for parsing AI-generated XML diffs securely.
-   **Packaging & Updates:** `electron-builder` for creating installers and `electron-updater` for auto-updates.
-   **Package Manager**: pnpm

## Installation and Usage

1.  **Install Dependencies**:
    ```bash
    pnpm install
    ```

2.  **Run in Development Mode**:
    This starts the Vite dev server and Electron with hot-reloading for the renderer.
    ```bash
    pnpm dev
    ```

3.  **Build for Production**:
    ```bash
    pnpm build
    ```

4.  **Package for Distribution**:
    After building, this creates the platform-specific installer (e.g., `.dmg`, `.exe`).
    ```bash
    pnpm dist
    ```

## Troubleshooting

If you encounter issues during setup, try these common solutions:

1.  **Hard Reset:** The most effective fix for many dependency and cache-related issues.
    ```bash
    rm -rf node_modules
    rm pnpm-lock.yaml
    pnpm install
    ```

2.  **Clear Caches:** If the above doesn't work, clear pnpm's global store cache and Vite's cache.
    ```bash
    pnpm store prune
    rm -rf node_modules/.vite
    ```

3.  **Check Electron Installation:** Ensure Electron was downloaded correctly. If you suspect an issue:
    ```bash
    pnpm add electron@latest --force
    ```