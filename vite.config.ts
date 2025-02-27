/**
 * File: vite.config.ts
 * Description: Vite configuration for the renderer, enabling React and Tailwind.
 * Outputs to dist/renderer, sets base to './'.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@common': path.resolve(__dirname, 'src/common')
    }
  },
  base: './',
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/renderer/index.html')
      }
    }
  },
  define: {
    'process.env': {},
    'global': 'window'
  },
  server: {
    port: 5173,
    open: false
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  css: {
    postcss: './postcss.config.cjs'
  }
});