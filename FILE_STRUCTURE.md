# FILE_STRUCTURE.md

repoprompter/
├─ .gitignore
├─ package.json
├─ pnpm-lock.yaml
├─ tsconfig.json
├─ electron-builder.json
├─ electron.vite.config.ts
├─ vite.config.ts
│
├─ src/
│  ├─ main/                      # Electron Main Process
│  │  ├─ main.ts                 # App entry (creates BrowserWindow, sets up IPC)
│  │  ├─ preload.ts              # Expose safe APIs
│  │  └─ autoUpdater.ts          # (Optional) Auto-update logic
│  │
│  ├─ common/                    # Shared logic
│  │  ├─ fileSystem.ts           # Read/write filesystem
│  │  ├─ diffParser.ts           # Parse & apply XML diffs
│  │  ├─ promptBuilder.ts        # Combine user instructions + code
│  │  └─ types.ts                # Type definitions for preload APIs, etc.
│  │
│  ├─ renderer/                  # React Frontend
│  │  ├─ App.tsx                 # Main React App (3-pane layout)
│  │  ├─ index.html              # HTML template
│  │  ├─ index.tsx               # React entry point
│  │  ├─ components/             # UI pieces
│  │  │  ├─ DirectorySelector.tsx
│  │  │  ├─ FileList.tsx
│  │  │  ├─ PromptEditor.tsx
│  │  │  ├─ DiffViewer.tsx
│  │  │  └─ CodeEditorTabs.tsx   # New: Monaco-like code editor with tabs
│  │  ├─ hooks/
│  │  │  └─ useRepoContext.ts    # Shared context for selected dir/files + diff changes
│  │  └─ styles/                 # (Optional) any CSS or tailwind files
│  │
│  └─ stores/                    # (Optional) if you want separate store logic
│
├─ public/                       # static assets (icons, blank.tsx placeholders)
│  └─ icon.png
│
└─ resources/                    # (Optional) extra assets or sample files
   └─ sample.json