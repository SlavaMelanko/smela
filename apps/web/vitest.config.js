import path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler']
      }
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.js'],
    include: ['**/__tests__/**/*.{js,jsx}', '**/*.{spec,test}.{js,jsx}'],
    exclude: ['node_modules', 'e2e', 'tests-examples'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/**/*.stories.{js,jsx}',
        'src/**/*.{test,spec}.{js,jsx}',
        'src/tests/**',
        'src/index.{js,jsx}',
        'src/App.{js,jsx}',
        'src/i18n.{js,jsx}',
        'src/main.{js,jsx}',
        // Presentation-only code — no business logic to measure
        'src/pages/**',
        'src/layouts/**',
        'src/routes/**',
        'src/components/ui/**',
        'src/devtools/**'
      ]
    },
    testTimeout: 10000,
    clearMocks: true,
    restoreMocks: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      $: path.resolve(__dirname, 'public')
    }
  }
})
