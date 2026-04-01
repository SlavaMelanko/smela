import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

import config from '../sync.config.js'

const root = resolve(import.meta.dirname, '..')
const watch = process.argv.includes('--watch')

const timestamp = () => new Date().toTimeString().slice(0, 8)

const copyAll = ({ from, to }) => {
  const src = resolve(root, from)

  try {
    mkdirSync(to, { recursive: true })

    for (const file of readdirSync(src).filter((f) => f.endsWith('.json'))) {
      copyFileSync(join(src, file), join(to, file))
      console.log(`${timestamp()}: synced ${file} → ${to}`)
    }
  } catch (err) {
    console.error(`${timestamp()}: sync failed (${from} → ${to}): ${err.message}`)
    process.exit(1)
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

      try {
        mkdirSync(entry.to, { recursive: true })
        copyFileSync(filePath, join(entry.to, file))
        console.log(`${timestamp()}: synced ${file} → ${entry.to}`)
      } catch (err) {
        console.error(`${timestamp()}: sync failed (${file} → ${entry.to}): ${err.message}`)
      }
    })
  }

  console.log(`${timestamp()}: watching for locale changes...`)
}
