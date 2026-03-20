import { loadEnv } from 'vite'

// NODE_ENV=test is set in package.json scripts.
// Vite's loadEnv loads VITE_* variables from .env.test file.
export const loadTestEnv = () => {
  Object.assign(process.env, loadEnv('test', './', 'VITE_'))
}

const globalSetup = () => {
  loadTestEnv()

  const requiredVars = [
    'VITE_MAILISK_API_KEY',
    'VITE_MAILISK_NAMESPACE',
    'VITE_E2E_OWNER_EMAIL',
    'VITE_E2E_OWNER_PASSWORD',
    'VITE_E2E_ADMIN_EMAIL',
    'VITE_E2E_ADMIN_PASSWORD',
    'VITE_E2E_USER_EMAIL',
    'VITE_E2E_USER_PASSWORD'
  ]

  const missing = requiredVars.filter(v => !process.env[v])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\nCheck your .env.test file.`
    )
  }
}

export default globalSetup
