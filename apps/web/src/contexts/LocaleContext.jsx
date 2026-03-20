import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

import i18n from '@/i18n'
import {
  datePreset,
  formatDate,
  formatNumber,
  formatPrice,
  formatTime
} from '@/lib/format'
import {
  loadFormatPreferences,
  storeFormatPreferences,
  storeLocale
} from '@/lib/userPreferences'

const LocaleContext = createContext()

export const LocaleProvider = ({ children }) => {
  // At this point, i18n is already initialized with the correct locale,
  // so we trust i18n.language as the single source of truth
  const [locale, setLocale] = useState(i18n.language)
  const [formatPreferences, setFormatPreferences] = useState(() =>
    loadFormatPreferences(i18n.language)
  )

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const changeLocale = useCallback(newLocale => {
    setLocale(newLocale)
    i18n.changeLanguage(newLocale)
    storeLocale(newLocale)
  }, [])

  const changeFormatPreference = useCallback((key, value) => {
    setFormatPreferences(prev => {
      const next = { ...prev, [key]: value }

      storeFormatPreferences(next)

      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      locale,
      changeLocale,
      formatPreferences,
      changeFormatPreference,
      formatNumber: (value, options) => formatNumber(value, locale, options),
      formatNumberWithUnit: (value, unit, options) =>
        `${formatNumber(value, locale, options)} ${unit}`,
      formatPrice: (value, currency, options) =>
        formatPrice(value, locale, currency, options),
      formatDate: (date, options) =>
        formatDate(date, locale, options ?? datePreset[formatPreferences.date]),
      formatTime: (date, hour12) =>
        formatTime(date, locale, hour12 ?? formatPreferences.time === '12')
    }),
    [locale, changeLocale, formatPreferences, changeFormatPreference]
  )

  return <LocaleContext value={value}>{children}</LocaleContext>
}

export default LocaleContext
