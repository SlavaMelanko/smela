import { describe, expect, test } from 'bun:test'

import AppError, { APP_ERROR_NAME } from '../app-error'
import ErrorCode from '../codes'
import ErrorRegistry from '../registry'

describe('AppError', () => {
  test('takes code, name, and message from ErrorRegistry', () => {
    const errorCodes = Object.values(ErrorCode)

    for (const code of errorCodes) {
      const error = new AppError(code)

      expect(error.code).toBe(code)
      expect(error.name).toBe(APP_ERROR_NAME)
      expect(error.message).toBe(ErrorRegistry[code].error)
    }
  })

  const blankMessages = [
    { name: 'undefined', message: undefined },
    { name: 'null', message: null },
    { name: 'empty string', message: '' },
    { name: 'whitespace-only', message: '   ' }
  ]

  blankMessages.forEach(({ name, message }) => {
    test(`falls back to ErrorRegistry for ${name} custom message`, () => {
      // @ts-expect-error - null is invalid input
      const error = new AppError(ErrorCode.InvalidCredentials, message)

      expect(error.code).toBe(ErrorCode.InvalidCredentials)
      expect(error.name).toBe(APP_ERROR_NAME)
      expect(error.message).toBe(
        ErrorRegistry[ErrorCode.InvalidCredentials].error
      )
    })
  })

  test('overrides ErrorRegistry message with custom message', () => {
    const customMessage = 'Custom error message for testing'
    const error = new AppError(ErrorCode.InvalidCredentials, customMessage)

    expect(error.code).toBe(ErrorCode.InvalidCredentials)
    expect(error.name).toBe(APP_ERROR_NAME)
    expect(error.message).toBe(customMessage)
  })
})
