import i18n from '@/i18n'

import { toBackendError } from './backend/error'

export const toTranslationKey = (error, fallbackKey = 'error.unknown') => {
  const key = toBackendError(error)

  const keyExistsInTheTranslationFile = i18n.exists(key)

  return keyExistsInTheTranslationFile ? key : fallbackKey
}
