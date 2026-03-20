import { localStorage } from '@/lib/storage'

const Key = {
  THEME: 'theme',
  LOCALE: 'locale',
  FORMAT: 'locale_format'
}

//
// Theme
//

export const loadTheme = () => {
  const stored = localStorage.get(Key.THEME)

  if (stored) {
    return stored
  }

  const prefersDark =
    window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false

  return prefersDark ? 'dark' : 'light'
}

export const storeTheme = value => localStorage.set(Key.THEME, value)

//
// Locale & Format
//

export const DEFAULT_LOCALE = 'en'

export const loadLocale = () => localStorage.get(Key.LOCALE) ?? DEFAULT_LOCALE

export const storeLocale = value => localStorage.set(Key.LOCALE, value)

const getDefaultTimeFormat = locale => {
  const resolved = new Intl.DateTimeFormat(locale).resolvedOptions()

  // h12/h11 = 12-hour, h23/h24 = 24-hour
  return resolved.hourCycle?.startsWith('h1') ? '12' : '24'
}

export const loadFormatPreferences = locale => {
  const defaults = {
    date: 'numeric',
    time: getDefaultTimeFormat(locale)
  }

  try {
    const stored = localStorage.get(Key.FORMAT)

    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults
  } catch {
    return defaults
  }
}

export const storeFormatPreferences = value =>
  localStorage.set(Key.FORMAT, JSON.stringify(value))
