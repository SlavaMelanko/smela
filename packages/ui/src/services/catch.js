import i18next from 'i18next'

import { toBackendError } from './backend/error'

export const toTranslationKey = (error, fallbackKey = 'error.unknown') => {
  const key = toBackendError(error)

  const keyExistsInTheTranslationFile = i18next.exists(key)

  return keyExistsInTheTranslationFile ? key : fallbackKey
}
