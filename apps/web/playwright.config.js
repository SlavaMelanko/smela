import { defineBaseConfig } from '@smela/e2e/config'

import { loadTestEnv } from './e2e/config/globalSetup'

loadTestEnv()

export default defineBaseConfig({
  testDir: './e2e',
  globalSetup: './e2e/config/globalSetup.js',
  baseURL: process.env.VITE_FE_BASE_URL || 'http://localhost:5173',
  devCommand: 'bun run dev'
})
