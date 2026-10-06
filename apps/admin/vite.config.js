/* global process */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { codecovVitePlugin } from '@codecov/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isProdOrStage =
  process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'

export default defineConfig({
  server: {
    port: 5175
  },
  preview: {
    port: 5175
  },
  build: {
    sourcemap: isProdOrStage ? 'hidden' : true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  },
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]]
      }
    }),
    tailwindcss(),
    process.env.ANALYZE_BUNDLE &&
      visualizer({
        filename: 'dist/bundle-visualizer.html',
        open: !process.env.CI,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap'
      }),
    // Codecov requires its plugin to be last
    process.env.ANALYZE_BUNDLE &&
      codecovVitePlugin({
        enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
        bundleName: 'admin',
        uploadToken: process.env.CODECOV_TOKEN
      })
  ].filter(Boolean),
  resolve: {
    dedupe: ['react', 'react-dom', '@tanstack/react-query'],
    alias: {
      '@ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@': path.resolve(__dirname, 'src')
    }
  }
})
