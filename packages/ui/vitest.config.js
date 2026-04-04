import path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.js'],
    include: ['**/__tests__/**/*.{js,jsx}', '**/*.{spec,test}.{js,jsx}'],
    exclude: ['node_modules'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/**/*.stories.{js,jsx}',
        'src/**/*.{test,spec}.{js,jsx}',
        'src/index.js'
      ]
    },
    clearMocks: true,
    restoreMocks: true,
    passWithNoTests: true
  },
  resolve: {
    alias: {
      '#': path.resolve(__dirname, 'src')
    }
  }
})
