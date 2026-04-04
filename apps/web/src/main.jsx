import '@smela/ui/index.css'

import { initErrorTracker } from '@smela/ui/services'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import packageJson from '../package.json' with { type: 'json' }

initErrorTracker({
  name: packageJson.name,
  version: packageJson.version
})

import './i18n'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
