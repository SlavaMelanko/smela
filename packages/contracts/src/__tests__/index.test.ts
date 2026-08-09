import { describe, expect, it } from 'bun:test'

import { placeholder } from '../index'

describe('index', () => {
  it('exports the placeholder', () => {
    expect(placeholder).toBe(true)
  })
})
