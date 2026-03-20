import { HttpStatus } from '@/lib/net'

import { createError } from '../error'

describe('createError', () => {
  it('should parse backend error response correctly', async () => {
    const backendErrorResponse = {
      name: 'AppError',
      code: 'refresh-token/missing',
      error: 'Refresh token is missing.',
      stack:
        'AppError: Refresh token is missing.\n    at <anonymous> (/Users/slavamelanko/GitHub/smela-back/src/use-cases/auth/refresh-token.ts:17:15)'
    }

    const mockResponse = {
      ok: false,
      status: HttpStatus.BAD_REQUEST,
      json: jest.fn().mockResolvedValueOnce(backendErrorResponse)
    }

    const error = await createError(mockResponse)

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('AppError')
    expect(error.code).toBe('refresh-token/missing')
    expect(error.status).toBe(HttpStatus.BAD_REQUEST)
    expect(error.message).toBe('Refresh token is missing.')
  })

  it('should handle response with no JSON body', async () => {
    const mockResponse = {
      ok: false,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON'))
    }

    const error = await createError(mockResponse)

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('AppError')
    expect(error.code).toBe('system:internal-error')
    expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    expect(error.message).toBe('Request failed with status 500')
  })

  it('should use defaults when error data is incomplete', async () => {
    const mockResponse = {
      ok: false,
      status: HttpStatus.NOT_FOUND,
      json: jest.fn().mockResolvedValueOnce({})
    }

    const error = await createError(mockResponse)

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('AppError')
    expect(error.code).toBe('system:internal-error')
    expect(error.status).toBe(HttpStatus.NOT_FOUND)
    expect(error.message).toBe('Request failed with status 404')
  })

  it('should handle partial error data', async () => {
    const mockResponse = {
      ok: false,
      status: HttpStatus.UNAUTHORIZED,
      json: jest.fn().mockResolvedValueOnce({
        error: 'Unauthorized access'
      })
    }

    const error = await createError(mockResponse)

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('AppError')
    expect(error.code).toBe('system:internal-error')
    expect(error.status).toBe(HttpStatus.UNAUTHORIZED)
    expect(error.message).toBe('Unauthorized access')
  })
})
