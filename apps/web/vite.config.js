import { sentryVitePlugin } from '@sentry/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import webpackStatsPlugin from 'rollup-plugin-webpack-stats'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

import packageJson from './package.json' with { type: 'json' }

// Simulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isProdOrStage =
  process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'

// TanStack Table uses interior mutability: it modifies config objects in place
// while keeping the same reference. React Compiler assumes immutable props and
// memoizes based on reference equality, so these mutations go undetected.
// Excluding table components forces React to re-render them normally.
const reactCompilerOptions = {
  sources: filename => !filename.includes('src/components/table/')
}

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
    alias: {
      '@': path.resolve(__dirname, 'src'),
      $: path.resolve(__dirname, 'public')
    }
  }
})
