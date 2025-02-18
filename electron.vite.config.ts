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
      outDir: '../dist/renderer',
      rollupOptions: {
        input: {
          index: path.join(__dirname, 'src/renderer/index.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src/renderer'),
      },
    },
    server: {
      port: 5174,
    },
    plugins: [react()],
  },
})