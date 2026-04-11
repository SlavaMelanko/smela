import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')
const dest = path => resolve(root, path)

export default [
  {
    from: 'src/resources',
    to: dest('apps/web/public/locales')
  },
  {
    from: 'src/resources',
    to: dest('apps/admin/public/locales')
  }
]
