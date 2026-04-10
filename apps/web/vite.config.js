/* global process */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { sentryVitePlugin } from '@sentry/vite-plugin'
import { reactCompilerOptions } from '@smela/ui/react-compiler'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import webpackStatsPlugin from 'rollup-plugin-webpack-stats'
import { defineConfig } from 'vite'

import packageJson from './package.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isProdOrStage =
  process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'

export default defineConfig({
  build: {
    sourcemap: isProdOrStage ? 'hidden' : true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
  define: {
    // Strip Sentry debug logging from production bundles
    __SENTRY_DEBUG__: false
  },
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', reactCompilerOptions]]
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
    process.env.ANALYZE_BUNDLE &&
      webpackStatsPlugin({
        filename: 'dist/webpack-stats.json',
        stats: {
          all: false,
          assets: true,
          chunks: true,
          modules: true,
          reasons: true,
          chunkModules: true
        }
      }),
    process.env.SENTRY_AUTH_TOKEN &&
      sentryVitePlugin({
        org: 'smela',
        project: `${packageJson.name}`,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: {
          name: `${packageJson.name}@${packageJson.version}`
        },
        sourcemaps: {
          filesToDeleteAfterUpload: ['./dist/**/*.map']
        }
      })
  ].filter(Boolean),
  resolve: {
    dedupe: ['react', 'react-dom', '@tanstack/react-query'],
    alias: {
      '@ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@': path.resolve(__dirname, 'src')
    }
  },
  // Ensure Vite processes JSX from the @smela/ui workspace package
  optimizeDeps: {
    include: ['@smela/ui']
  }
})
