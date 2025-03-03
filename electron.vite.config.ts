/**
 * File: electron.vite.config.ts
 * Description: Configuration for electron-vite, specifying main, preload, and renderer build outputs.
 */

import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Disable auto-start so we only see the window from main.ts
  main: {
    start: false,
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        input: {
          index: path.join(__dirname, 'src/main/main.ts'),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },
  },
  preload: {
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        input: {
          index: path.join(__dirname, 'src/main/preload.ts'),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },
  },
  renderer: {
    root: path.join(__dirname, 'src/renderer'),
    build: {
      outDir: path.join(__dirname, 'dist/renderer'),
      rollupOptions: {
        input: {
          index: path.join(__dirname, 'src/renderer/index.html'),
        },
      },
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
        '@renderer': path.join(__dirname, 'src/renderer'),
        '@common': path.join(__dirname, 'src/common'),
      },
    },
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      open: false,
      strictPort: true,
      hmr: {
        port: 5173
      }
    },
  },
})