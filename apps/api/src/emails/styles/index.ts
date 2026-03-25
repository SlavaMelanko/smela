import type { Theme } from '@/types'

import { get } from './mixins'
import { color } from './themes'
import { borderRadius, font, spacing } from './variables'

const styles = {
  color,
  font,
  spacing,
  borderRadius,
  get,
} as const

export const getThemeStyles = (theme: Theme = 'light') => {
  return { ...styles, ...styles.get(theme), color: styles.color[theme] }
}

export type ThemeStyles = ReturnType<typeof getThemeStyles>

export default styles
