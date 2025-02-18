import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        input: {
          index: path.join(__dirname, 'src/main/main.ts'),
        },
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
  },
  renderer: {
    root: path.join(__dirname, 'src/renderer'),
    build: {
      outDir: path.join(__dirname, 'dist/renderer'),
    },
    server: {
      port: 5174,
    },
    plugins: [react()],
  },
})