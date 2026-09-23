import { createAuth, updateAuth } from './mutations'
import { findByProvider, findByUserId } from './queries'

export * from './types'

export const authRepo = {
  create: createAuth,
  findById: findByUserId,
  findByProvider,
  update: updateAuth
}
