import {
  createSocialLink,
  deleteSocialLink,
  updateSocialLink
} from './mutations'
import { findAllSocialLinks, findSocialLinkById } from './queries'

export * from './types'

const socialLinkMutations = {
  createSocialLink,
  updateSocialLink,
  deleteSocialLink
}

const socialLinkQueries = {
  findSocialLinks: findAllSocialLinks,
  findSocialLinkById
}

export const appRepo = {
  ...socialLinkMutations,
  ...socialLinkQueries
}
