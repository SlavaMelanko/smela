import { HttpStatus } from '@/lib/net'

describe('ApiClient', () => {
  let createApiClient
  let mockFetch
  let apiClient

  beforeAll(async () => {
    // Local mock - scoped only to this test file
    jest.doMock('@/lib/env', () => ({
      default: {
        BE_BASE_URL: 'https://api.example.com'
      }
    }))

    // Dynamic import after mock is set up
    const factory = await import('../factory')

    createApiClient = factory.createApiClient
  })

  afterAll(() => {
    jest.unmock('@/lib/env')
  })

  beforeEach(() => {
    mockFetch = jest.fn()
    apiClient = createApiClient({
      baseUrl: 'https://api.test.com',
      httpClient: mockFetch
    })
  })

  describe('GET requests', () => {
    it('should make a successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce(mockData)
      })

      const result = await apiClient.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      )

      expect(result).toEqual(mockData)
    })

    it('should handle 204 No Content response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: HttpStatus.NO_CONTENT
      })

      const result = await apiClient.get('/test')

      expect(result).toBeNull()
    })
  })

  describe('POST requests', () => {
    it('should make a successful POST request with data', async () => {
      const mockData = { id: 1, name: 'Created' }
      const requestData = { name: 'Test' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValueOnce(mockData)
      })

      const result = await apiClient.post('/test', requestData)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      )

      expect(result).toEqual(mockData)
    })
  })

  describe('PUT requests', () => {
    it('should make a successful PUT request', async () => {
      const mockData = { id: 1, name: 'Updated' }
      const requestData = { name: 'Updated Test' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce(mockData)
      })

      const result = await apiClient.put('/test/1', requestData)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(requestData)
        })
      )

      expect(result).toEqual(mockData)
    })
  })

  describe('DELETE requests', () => {
    it('should make a successful DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: HttpStatus.NO_CONTENT
      })

      const result = await apiClient.delete('/test/1')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'DELETE'
        })
      )

      expect(result).toBeNull()
    })
  })

  describe('Error handling', () => {
    it('should throw error for failed requests', async () => {
      const errorResponse = {
        error: 'Not found',
        name: 'NotFoundError',
        code: 'resource:not-found'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValueOnce(errorResponse)
      })

      await expect(apiClient.get('/test')).rejects.toThrow('Not found')
    })

    it('should handle error response without JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON'))
      })

      await expect(apiClient.get('/test')).rejects.toThrow(
        'Request failed with status 500'
      )
    })

    it('should create proper error object with all properties', async () => {
      const errorResponse = {
        error: 'Validation failed',
        name: 'ValidationError',
        code: 'validation:invalid-input'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValueOnce(errorResponse)
      })

      try {
        await apiClient.get('/test')
      } catch (error) {
        expect(error.message).toBe('Validation failed')
        expect(error.name).toBe('ValidationError')
        expect(error.code).toBe('validation:invalid-input')
        expect(error.status).toBe(400)
      }
    })
  })

  describe('Headers and configuration', () => {
    it('should include custom headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce({})
      })

      await apiClient.get('/test', {
        headers: {
          Authorization: 'Bearer token123'
        }
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer token123'
          }
        })
      )
    })

    it('should always include credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce({})
      })

      await apiClient.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include'
        })
      )
    })
  })

  describe('Token refresh', () => {
    it('should refresh token only for auth/unauthorized error code', async () => {
      const unauthorizedError = {
        error: 'Unauthorized access',
        name: 'UnauthorizedError',
        code: 'auth/unauthorized'
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: HttpStatus.UNAUTHORIZED,
          json: jest.fn().mockResolvedValueOnce(unauthorizedError)
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValueOnce({ accessToken: 'new-token' })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValueOnce({ data: 'success' })
        })

      const result = await apiClient.get('/protected')

      expect(result).toEqual({ data: 'success' })
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should not refresh token for auth/invalid-credentials', async () => {
      const invalidCredsError = {
        error: 'Invalid email or password',
        name: 'InvalidCredentialsError',
        code: 'auth/invalid-credentials'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: HttpStatus.UNAUTHORIZED,
        json: jest.fn().mockResolvedValueOnce(invalidCredsError)
      })

      await expect(apiClient.post('/login', {})).rejects.toMatchObject({
        message: 'Invalid email or password',
        code: 'auth/invalid-credentials',
        status: HttpStatus.UNAUTHORIZED
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should not refresh token for refresh-token/expired', async () => {
      const expiredRefreshToken = {
        error: 'Refresh token expired',
        name: 'RefreshTokenExpiredError',
        code: 'refresh-token/expired'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: HttpStatus.UNAUTHORIZED,
        json: jest.fn().mockResolvedValueOnce(expiredRefreshToken)
      })

      await expect(apiClient.get('/protected')).rejects.toMatchObject({
        message: 'Refresh token expired',
        code: 'refresh-token/expired',
        status: HttpStatus.UNAUTHORIZED
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should not refresh token for 401 without error code', async () => {
      const genericError = {
        error: 'Unauthorized'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: HttpStatus.UNAUTHORIZED,
        json: jest.fn().mockResolvedValueOnce(genericError)
      })

      await expect(apiClient.get('/protected')).rejects.toMatchObject({
        message: 'Unauthorized',
        code: 'system:internal-error',
        status: HttpStatus.UNAUTHORIZED
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('Timeout handling', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should abort request after timeout expires', async () => {
      const abortError = new Error('Aborted')

      abortError.name = 'AbortError'

      mockFetch.mockImplementationOnce(
        (url, config) =>
          new Promise((resolve, reject) => {
            config.signal.addEventListener('abort', () => {
              reject(abortError)
            })
          })
      )

      const requestPromise = apiClient.get('/test')

      jest.advanceTimersByTime(15000)

      await expect(requestPromise).rejects.toThrow(
        'Operation timed out after 15000ms'
      )
    })

    it('should clear timeout after successful request', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce({ data: 'test' })
      })

      await apiClient.get('/test')

      expect(clearTimeoutSpy).toHaveBeenCalled()

      clearTimeoutSpy.mockRestore()
    })

    it('should clear timeout after failed request', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValueOnce({
          error: 'Server error'
        })
      })

      await expect(apiClient.get('/test')).rejects.toThrow()

      expect(clearTimeoutSpy).toHaveBeenCalled()

      clearTimeoutSpy.mockRestore()
    })

    it('should use custom timeout when configured', async () => {
      const customClient = createApiClient({
        baseUrl: 'https://api.test.com',
        httpClient: mockFetch,
        timeout: 5000
      })

      const abortError = new Error('Aborted')

      abortError.name = 'AbortError'

      mockFetch.mockImplementationOnce(
        (url, config) =>
          new Promise((resolve, reject) => {
            config.signal.addEventListener('abort', () => {
              reject(abortError)
            })
          })
      )

      const requestPromise = customClient.get('/test')

      jest.advanceTimersByTime(5000)

      await expect(requestPromise).rejects.toThrow(
        'Operation timed out after 5000ms'
      )
    })
  })
})
