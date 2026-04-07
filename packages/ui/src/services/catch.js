import { toBackendError } from './backend/error'

export const toTranslationKey = (error, fallbackKey = 'error.unknown') => {
  return toBackendError(error) ?? fallbackKey
}
