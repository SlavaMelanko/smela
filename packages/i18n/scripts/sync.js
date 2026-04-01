import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

import config from '../sync.config.js'

const root = resolve(import.meta.dirname, '..')
const watch = process.argv.includes('--watch')

const timestamp = () => new Date().toTimeString().slice(0, 8)

const copyAll = ({ from, to }) => {
  const src = resolve(root, from)
  const dest = resolve(root, to)

  mkdirSync(dest, { recursive: true })

  for (const file of readdirSync(src).filter((f) => f.endsWith('.json'))) {
    copyFileSync(join(src, file), join(dest, file))
    console.log(`${timestamp()}: synced ${file} → ${to}`)
  }
}

for (const entry of config) {
  copyAll(entry)
}

if (watch) {
  const { watch: chokidarWatch } = await import('chokidar')

  for (const entry of config) {
    const src = resolve(root, entry.from)

    chokidarWatch(src, { ignoreInitial: true }).on('change', (filePath) => {
      if (!filePath.endsWith('.json')) return

      const file = filePath.split('/').pop()
      const dest = resolve(root, entry.to)

      mkdirSync(dest, { recursive: true })
      copyFileSync(filePath, join(dest, file))
      console.log(`${timestamp()}: synced ${file} → ${entry.to}`)
    })
  }

  console.log(`watching for locale changes...`)
}
