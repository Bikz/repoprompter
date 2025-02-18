repoprompter/
├─ .gitignore
├─ package.json
├─ tsconfig.json               # or jsconfig.json if JavaScript
├─ electron-builder.yml        # or electron-builder.json for build & auto-update
├─ yarn.lock / package-lock.json
│
├─ src/
│  ├─ main/                    # Electron Main Process
│  │  ├─ main.ts               # App entry (creates BrowserWindow, etc.)
│  │  ├─ autoUpdater.ts        # Auto-update logic (GitHub releases)
│  │  └─ preload.ts            # Optional: expose safe APIs to renderer
│  │
│  ├─ renderer/                # React Frontend
│  │  ├─ App.tsx               # Root React component
│  │  ├─ index.tsx             # Renders <App /> into the DOM
│  │  ├─ components/           # Your UI pieces
│  │  │  ├─ DirectorySelector.tsx
│  │  │  ├─ FileList.tsx
│  │  │  ├─ PromptEditor.tsx
│  │  │  ├─ DiffViewer.tsx
│  │  │  └─ ...
│  │  ├─ pages/                # (Optional) If using React Router
│  │  └─ styles/
│  │     └─ global.css         # Or tailwind.css / custom Apple-like styling
│  │
│  ├─ common/                  # Shared logic
│  │  ├─ configManager.ts      # JSON prefs (e.g. last opened directory)
│  │  ├─ fileSystem.ts         # Functions to read directory, get file contents
│  │  ├─ promptBuilder.ts      # Combine selected code + user instructions
│  │  └─ diffParser.ts         # Parse XML diffs & apply changes
│
├─ public/                     # (Optional) static assets (icons, etc.)
│  └─ icon.png
│
└─ resources/                  # (Optional) for extra assets or sample files
   └─ sample.json