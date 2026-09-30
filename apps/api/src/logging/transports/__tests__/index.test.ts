import { describe, expect, it } from 'bun:test'

import { getTransports } from '..'
import { createConsoleTransport } from '../console'

describe('getTransports', () => {
  it('includes the console transport', () => {
    expect(getTransports()).toEqual([createConsoleTransport()])
  })
})
