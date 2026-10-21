import { NicknameConstraint } from '@smela/contracts'
import { describe, expect, it } from 'bun:test'

import { resolveNickname } from '../resolve-nickname'

describe('resolveNickname', () => {
  it('prefers the supplied nickname and trims it', () => {
    expect(resolveNickname('email@example.com', '  Слава 🌻  ', 'Slava')).toBe(
      'Слава 🌻'
    )
  })

  it('uses the first non-empty candidate', () => {
    expect(
      resolveNickname('email@example.com', undefined, '  ', ' Slava ')
    ).toBe('Slava')
  })

  it('falls back to the email prefix without its plus tag', () => {
    expect(resolveNickname('slava+test@example.com')).toBe('slava')
  })

  it('keeps the whole email prefix when the plus tag is all there is', () => {
    expect(resolveNickname('+test@example.com')).toBe('+test')
  })

  it('limits generated nicknames to the shared maximum', () => {
    expect(resolveNickname(`${'a'.repeat(64)}+tag@example.com`)).toHaveLength(
      NicknameConstraint.MAX_LENGTH
    )
    expect(resolveNickname('email@example.com', 'a'.repeat(100))).toHaveLength(
      NicknameConstraint.MAX_LENGTH
    )
  })
})
