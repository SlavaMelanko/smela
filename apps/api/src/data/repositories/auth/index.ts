import { createAuth, deleteAuthByProvider, updateAuth } from './mutations'
import { findByProvider, findByUserId } from './queries'

export * from './types'

export const authRepo = {
  create: createAuth,
  deleteByProvider: deleteAuthByProvider,
  findById: findByUserId,
  findByProvider,
  update: updateAuth
}
