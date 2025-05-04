import { defineConfig } from 'electron-vite'
import { resolve } from 'path'

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/electron/main',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main/index.ts')
        },
      }
    }
  },
  preload: {
    build: {
      outDir: 'dist/electron/preload',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload/index.ts')
        },
      }
    }
  },
  renderer: {
    root: '.',
    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html')
        },
      }
    }
  }
})