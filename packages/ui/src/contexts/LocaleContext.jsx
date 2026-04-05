import {
  datePreset,
  formatDate,
  formatNumber,
  formatPrice,
  formatTime
} from '@ui/lib/format'
import {
  loadFormatPreferences,
  storeFormatPreferences,
  storeLocale
} from '@ui/lib/userPreferences'
import i18next from 'i18next'
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

const LocaleContext = createContext()

export const LocaleProvider = ({ children }) => {
  // At this point, i18n is already initialized with the correct locale,
  // so we trust i18next.language as the single source of truth
  const [locale, setLocale] = useState(i18next.language)
  const [formatPreferences, setFormatPreferences] = useState(() =>
    loadFormatPreferences(i18next.language)
  )

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const changeLocale = useCallback(newLocale => {
    setLocale(newLocale)
    i18next.changeLanguage(newLocale)
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
