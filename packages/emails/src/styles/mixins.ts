import type { Theme } from '../user-preferences'

import { color } from './themes'
import { font } from './variables'

export const get = (theme: Theme = 'light') => ({
  text: {
    body: {
      fontFamily: font.family.sans,
      fontSize: font.size.base,
      fontWeight: font.weight.normal,
      lineHeight: font.lineHeight.normal,
      color: color[theme].text.primary
    },
    detail: {
      fontFamily: font.family.sans,
      fontSize: font.size.sm,
      fontWeight: font.weight.thin,
      lineHeight: font.lineHeight.normal,
      color: color[theme].text.tertiary
    },
    legal: {
      fontFamily: font.family.sans,
      fontSize: font.size.xs,
      fontWeight: font.weight.thin,
      lineHeight: font.lineHeight.normal,
      color: color[theme].text.tertiary
    }
  },

  link: {
    color: color[theme].link,
    textDecoration: 'underline',
    fontWeight: font.weight.medium
  },

  icon: {
    display: 'inline-block',
    width: '24px',
    height: '24px',
    color: color[theme].link,
    stroke: color[theme].link,
    strokeWidth: '1.5',
    fill: 'none'
  }
})
