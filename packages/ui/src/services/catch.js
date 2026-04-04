import { toBackendError } from './backend/error'

export const toTranslationKey = (error, i18n, fallbackKey = 'error.unknown') => {
  const key = toBackendError(error)

  const keyExistsInTheTranslationFile = i18n.exists(key)

  return keyExistsInTheTranslationFile ? key : fallbackKey
}
