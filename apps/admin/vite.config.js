/* global process */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { codecovVitePlugin } from '@codecov/vite-plugin'
import babel from '@rolldown/plugin-babel'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isProdOrStage =
  process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'

// Remote builds create source maps only to upload them to Sentry. The plugin
// deletes them after upload, so they never ship in dist/
const uploadSourceMaps = isProdOrStage && !!process.env.SENTRY_AUTH_TOKEN

const getSourcemap = () => {
  if (!isProdOrStage) {
    return true
  }

  return uploadSourceMaps ? 'hidden' : false
}

export default defineConfig({
  server: {
    port: 5175
  },
  preview: {
    port: 5175
  },
  build: {
    sourcemap: getSourcemap(),
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    process.env.ANALYZE_BUNDLE &&
      visualizer({
        filename: 'dist/bundle-visualizer.html',
        open: !process.env.CI,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap'
      }),
    uploadSourceMaps &&
      sentryVitePlugin({
        sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
        telemetry: false
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
