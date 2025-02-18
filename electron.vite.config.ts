import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import path from 'path';

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
        '@': path.join(__dirname, 'src/renderer'),
      },
    },
    plugins: [react()],
  },
});