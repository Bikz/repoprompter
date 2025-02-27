# Repoprompter

Repoprompter is a desktop app (Electron + Vite React) that allows users to interact with their Git repositories in a streamlined manner.

## Features

1. Opens a local directory (the user's Git repo).
2. Lets users select which folders or files they want to feed as context.
3. Provides a prompt area for users to type instructions to the AI.
4. Generates a combined prompt (code + instructions) for users to copy/paste into ChatGPT.
5. Users paste back the AI's XML diff.
6. Displays the diff for each file, allowing users to review and choose "accept" or "reject."
   - On accept, the patch is applied to the local file, providing near-instant code changes.

## Tech Stack

- **Electron**: Desktop app packaging, Node environment in the main process.
- **React + TypeScript**: Modern UI in the renderer.
- **electron-updater or electron-builder**: Auto-update from GitHub.
- **Local FS**: Via Node's `fs` or `fs-extra` in the main process.
- **Diff Library**: (Optional) A small diff library or custom logic to apply patches from ChatGPT's XML.
- **Styling**: Could be plain CSS or a framework (e.g., Tailwind). For a sleek Apple-like design, consider minimalistic pastel colors, subtle shadows, and an Apple-style layout.
- **Package Manager**: pnpm

## Installation and Usage

To get started with the Repoprompter app, follow these commands:

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Run Development Server**:
   ```bash
   pnpm dev
   ```

3. **Build for Production**:
   ```bash
   pnpm build && pnpm dist
   ```

## Troubleshooting Steps

If you encounter issues with the Electron installation when trying to run your Vite React Electron app, follow these steps:

1. **Check Electron Installation**:
   - Ensure that Electron is correctly installed in your project. You can check this by running:

     ```bash
     pnpm list electron
     ```

   - If it's not listed or if there's an issue, you can reinstall it:

     ```bash
     pnpm add electron@latest
     ```

2. **Verify Electron Version**:
   - Ensure that the installed version of Electron is compatible with other dependencies, especially `electron-vite`. Check the documentation for any version compatibility notes.

3. **Clear pnpm Cache**:
   - Clearing the cache can resolve issues with package installations:

    ```bash
     pnpm store prune
     ```

4. **Reinstall Dependencies**:
   - If the issue persists, try removing the `node_modules` directory and the lock file, then reinstalling:

     ```bash
     rm -rf node_modules
     rm pnpm-lock.yaml
     pnpm install
     ```

5. **Check for Deprecated Packages**:
   - Update any deprecated packages (like `eslint@8.57.1`) to their latest versions to avoid potential issues.

6. **Run `pnpm approve-builds`**:
   - Run `pnpm approve-builds` to allow specific dependencies to run scripts, which may be necessary for Electron to function correctly.

7. **Check Configuration**:
   - Ensure that your `vite.config.js` and `electron-builder` configurations are set up correctly. Look for any misconfigurations that could lead to the Electron path not being found.

8. **Consult Documentation**:
   - If the problem continues, refer to the documentation for `electron-vite` and `electron-builder` for specific setup instructions or troubleshooting tips.

### Example Command to Reinstall Electron:

```bash
pnpm add electron@latest
```

After following these steps, try running your development server again with:

```bash
pnpm dev
```

If you still encounter issues, please provide any new error messages or logs for further assistance.


####

'''
rm -rf dist
rm -rf node_modules/.vite
rm -rf node_modules/.cache
pnpm install
pnpm dev
'''
