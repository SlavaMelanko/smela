import { loadEnv } from 'vite'

// NODE_ENV=test is set in package.json scripts.
// Vite's loadEnv loads VITE_* variables from .env.test file.
export const loadTestEnv = () => {
  Object.assign(process.env, loadEnv('test', './', 'VITE_'))
}

const globalSetup = () => {
  loadTestEnv()
}

export default globalSetup
