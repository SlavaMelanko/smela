import { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import LocaleContext from '#/contexts/LocaleContext'
import { toTranslationKey } from '#/services/catch'

export const useLocale = (options = {}) => {
  const context = useContext(LocaleContext)
  const { t, i18n } = useTranslation(undefined, options)

  const te = useCallback(
    (error, fallbackKey = 'error.unknown') =>
      t(toTranslationKey(error, i18n, fallbackKey)),
    [t, i18n]
  )

  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }

  return { ...context, t, te }
}
