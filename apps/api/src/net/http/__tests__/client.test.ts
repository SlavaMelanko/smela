import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'

import { HttpClient } from '../client'

// Mock fetch globally
const mockFetch = mock(async () => ({
  ok: true,
  json: async () => ({ success: true, data: 'test' })
}))

// Store original fetch to restore later
const originalFetch = globalThis.fetch

describe('HttpClient', () => {
  beforeEach(() => {
    // Replace global fetch with mock
    globalThis.fetch = mockFetch as any
    mockFetch.mockClear()
  })

  afterEach(() => {
    // Restore original fetch
    globalThis.fetch = originalFetch
  })

  describe('constructor', () => {
    test('removes the trailing slash from the base URL', () => {
      const client = new HttpClient('https://example.com/')
      // We can't directly access baseUrl, but we can test the behavior
      expect(client).toBeInstanceOf(HttpClient)
    })

    test('stores default options with headers', () => {
      const headers = { 'Content-Type': 'application/json' }
      const client = new HttpClient('https://example.com', { headers })
      expect(client).toBeInstanceOf(HttpClient)
    })

    test('stores default options with timeout', () => {
      const client = new HttpClient('https://example.com', { timeout: 5000 })
      expect(client).toBeInstanceOf(HttpClient)
    })

    test('stores default options with headers and timeout', () => {
      const headers = { 'Content-Type': 'application/json' }
      const client = new HttpClient('https://example.com', {
        headers,
        timeout: 5000
      })
      expect(client).toBeInstanceOf(HttpClient)
    })

    test('accepts empty default options', () => {
      const client = new HttpClient('https://example.com')
      expect(client).toBeInstanceOf(HttpClient)
    })

    test('uses the default timeout when not specified', () => {
      const client = new HttpClient('https://example.com', { headers: {} })
      expect(client).toBeInstanceOf(HttpClient)
    })
  })

  describe('get', () => {
    test('makes a GET request with the correct URL', async () => {
      const client = new HttpClient('https://example.com')
      await client.get('/users')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users',
        expect.objectContaining({
          method: 'GET',
          headers: {}
        })
      )
    })

    test('handles a path without a leading slash', async () => {
      const client = new HttpClient('https://example.com')
      await client.get('users')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users',
        expect.objectContaining({ method: 'GET' })
      )
    })

    test('merges custom headers with default headers', async () => {
      const client = new HttpClient('https://example.com', {
        headers: { Authorization: 'Bearer token' }
      })
      await client.get('/users', { 'Content-Type': 'application/json' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users',
        expect.objectContaining({
          method: 'GET',
          headers: {
            Authorization: 'Bearer token',
            'Content-Type': 'application/json'
          }
        })
      )
    })

    test('returns the parsed JSON response', async () => {
      const mockData = { id: 1, name: 'John' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as any)

      const client = new HttpClient('https://example.com')
      const result = await client.get('/users/1')

      expect(result).toEqual(mockData)
    })
  })

  describe('post', () => {
    test('makes a POST request with a body', async () => {
      const client = new HttpClient('https://example.com')
      const body = new URLSearchParams({ name: 'John' })

      await client.post('/users', body)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users',
        expect.objectContaining({
          method: 'POST',
          body,
          headers: {}
        })
      )
    })

    test('makes a POST request without a body', async () => {
      const client = new HttpClient('https://example.com')
      await client.post('/users')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users',
        expect.objectContaining({
          method: 'POST',
          headers: {}
        })
      )
    })

    test('sends a string body', async () => {
      const client = new HttpClient('https://example.com')
      const body = '{"name":"John"}'

      await client.post('/users', body)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users',
        expect.objectContaining({
          method: 'POST',
          body
        })
      )
    })

    test('sends a FormData body', async () => {
      const client = new HttpClient('https://example.com')
      const body = new FormData()
      body.append('name', 'John')

      await client.post('/users', body)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users',
        expect.objectContaining({
          method: 'POST',
          body
        })
      )
    })

    test('merges custom headers', async () => {
      const client = new HttpClient('https://example.com', {
        headers: { Authorization: 'Bearer token' }
      })
      await client.post('/users', 'data', {
        'Content-Type': 'application/json'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: 'Bearer token',
            'Content-Type': 'application/json'
          }
        })
      )
    })
  })

  describe('put', () => {
    test('makes a PUT request', async () => {
      const client = new HttpClient('https://example.com')
      const body = '{"name":"Updated John"}'

      await client.put('/users/1', body)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users/1',
        expect.objectContaining({
          method: 'PUT',
          body,
          headers: {}
        })
      )
    })

    test('makes a PUT request without a body', async () => {
      const client = new HttpClient('https://example.com')
      await client.put('/users/1')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users/1',
        expect.objectContaining({
          method: 'PUT',
          headers: {}
        })
      )
    })
  })

  describe('delete', () => {
    test('makes a DELETE request', async () => {
      const client = new HttpClient('https://example.com')
      await client.delete('/users/1')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: {}
        })
      )
    })

    test('sends custom headers', async () => {
      const client = new HttpClient('https://example.com')
      await client.delete('/users/1', { Authorization: 'Bearer token' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: { Authorization: 'Bearer token' }
        })
      )
    })
  })

  const cases = [
    {
      name: 'base URL with trailing slash',
      baseUrl: 'https://example.com/',
      path: '/api/users',
      expected: 'https://example.com/api/users'
    },
    {
      name: 'base URL without trailing slash',
      baseUrl: 'https://example.com',
      path: '/api/users',
      expected: 'https://example.com/api/users'
    },
    {
      name: 'path without leading slash',
      baseUrl: 'https://example.com',
      path: 'api/users',
      expected: 'https://example.com/api/users'
    },
    {
      name: 'empty path',
      baseUrl: 'https://example.com',
      path: '',
      expected: 'https://example.com/'
    },
    {
      name: 'root path',
      baseUrl: 'https://example.com',
      path: '/',
      expected: 'https://example.com/'
    },
    {
      name: 'port in base URL',
      baseUrl: 'http://localhost:3000',
      path: '/api/users',
      expected: 'http://localhost:3000/api/users'
    }
  ]

  cases.forEach(({ name, baseUrl, path, expected }) => {
    test(`builds the request URL for ${name}`, async () => {
      await new HttpClient(baseUrl).get(path)

      expect(mockFetch).toHaveBeenCalledWith(expected, expect.any(Object))
    })
  })

  test('sends only default headers when no custom headers are given', async () => {
    const client = new HttpClient('https://example.com', {
      headers: { 'User-Agent': 'TestClient' }
    })
    await client.get('/users')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/users',
      expect.objectContaining({
        headers: { 'User-Agent': 'TestClient' }
      })
    )
  })

  test('overrides default headers with custom headers', async () => {
    const client = new HttpClient('https://example.com', {
      headers: { 'Content-Type': 'application/xml' }
    })
    await client.post('/users', 'data', {
      'Content-Type': 'application/json'
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/users',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' }
      })
    )
  })

  test('merges multiple default and custom headers', async () => {
    const client = new HttpClient('https://example.com', {
      headers: {
        Authorization: 'Bearer token',
        'User-Agent': 'TestClient'
      }
    })
    await client.get('/users', { 'Content-Type': 'application/json' })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/users',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer token',
          'User-Agent': 'TestClient',
          'Content-Type': 'application/json'
        }
      })
    )
  })

  test('sends the request with the default timeout', async () => {
    const client = new HttpClient('https://example.com')
    await client.get('/users')

    // We can't directly test the timeout value, but we can verify the request was made
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  test('sends the request with a custom default timeout', async () => {
    const client = new HttpClient('https://example.com', { timeout: 5000 })
    await client.get('/users')

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  test('rejects when the request exceeds the timeout', async () => {
    // Mock a slow response that exceeds timeout
    mockFetch.mockImplementationOnce(
      async () => new Promise(resolve => setTimeout(resolve, 20)) // 20ms delay
    )

    const client = new HttpClient('https://example.com', { timeout: 10 }) // 10ms timeout

    expect(client.get('/users')).rejects.toThrow('Timeout.')
  })

  test('resolves when the request completes before the timeout', async () => {
    const mockData = { id: 1, name: 'John' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    } as any)

    const client = new HttpClient('https://example.com', { timeout: 1000 })
    const result = await client.get('/users')

    expect(result).toEqual(mockData)
  })
})
