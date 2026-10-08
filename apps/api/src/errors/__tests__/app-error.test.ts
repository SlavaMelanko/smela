import { describe, expect, test } from 'bun:test'

import AppError, { APP_ERROR_NAME } from '../app-error'
import ErrorCode from '../codes'
import ErrorRegistry from '../registry'

describe('AppError', () => {
  test('takes message from ErrorRegistry by default', () => {
    const error = new AppError(ErrorCode.InvalidCredentials)

    expect(error.code).toBe(ErrorCode.InvalidCredentials)
    expect(error.name).toBe(APP_ERROR_NAME)
    expect(error.message).toBe(
      ErrorRegistry[ErrorCode.InvalidCredentials].message
    )
  })

  test('falls back to ErrorRegistry for blank custom message', () => {
    const error = new AppError(ErrorCode.InvalidCredentials, '')

    expect(error.message).toBe(
      ErrorRegistry[ErrorCode.InvalidCredentials].message
    )
  })

  test('overrides ErrorRegistry message with custom message', () => {
    const customMessage = 'Custom error message for testing'
    const error = new AppError(ErrorCode.InvalidCredentials, customMessage)

    expect(error.message).toBe(customMessage)
  })
})
