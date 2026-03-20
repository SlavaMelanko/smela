import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

import { loadTheme, storeTheme } from '@/lib/userPreferences'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(loadTheme)

  useEffect(() => {
    const root = document.documentElement

    root.classList.remove('light', 'dark')
    root.classList.add(theme)

    // Ensure browser-native UI (like form controls and scrollbars) match the theme
    root.style.colorScheme = theme

    storeTheme(theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext value={value}>{children}</ThemeContext>
}

export default ThemeContext
