import { withTimeout } from '@/lib/async'
import env from '@/lib/env'
import { HttpStatus } from '@/lib/net'
import { accessTokenStorage } from '@/lib/storage'

import { REFRESH_TOKEN_PATH } from '../paths'
import { createError } from './error'
import TokenRefreshManager from './tokenRefreshManager'

export class ApiClient {
  #baseUrl
  #defaultHeaders
  #httpClient
  #timeout
  #tokenRefreshManager = new TokenRefreshManager()

  constructor(config = {}) {
    this.#baseUrl = config.baseUrl || env.BE_BASE_URL
    this.#httpClient = config.httpClient || fetch.bind(window)
    this.#timeout = config.timeout ?? 15_000 // 15 seconds
    this.#defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers
    }
  }

  get(path, options = {}) {
    return this.#doRequest(path, {
      ...options,
      method: 'GET'
    })
  }

  post(path, data, options = {}) {
    return this.#doRequest(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  put(path, data, options = {}) {
    return this.#doRequest(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  patch(path, data, options = {}) {
    return this.#doRequest(path, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  delete(path, options = {}) {
    return this.#doRequest(path, {
      ...options,
      method: 'DELETE'
    })
  }

  async #doRequest(path, options = {}) {
    return withTimeout(async signal => {
      const url = `${this.#baseUrl}${path}`
      const config = {
        ...options,
        credentials: 'include',
        headers: this.#prepareHeaders(options),
        signal
      }

      const response = await this.#httpClient(url, config)

      if (!response.ok) {
        const error = await createError(response)

        if (
          response.status === HttpStatus.UNAUTHORIZED &&
          error.code === 'auth/unauthorized'
        ) {
          return this.#tokenRefreshManager.refreshAndRetry(
            () => {
              return this.#doRequest(path, options)
            },
            () => {
              return this.#refreshToken()
            },
            accessToken => {
              accessTokenStorage.set(accessToken)
            },
            () => {
              accessTokenStorage.remove()
            }
          )
        }

        // Enable TanStack Query error handling (retry, onError, error states)
        throw error
      }

      if (response.status === HttpStatus.NO_CONTENT) {
        return null
      }

      return response.json()
    }, this.#timeout)
  }

  #prepareHeaders(options) {
    const headers = {
      ...this.#defaultHeaders,
      ...options.headers
    }

    const token = accessTokenStorage.get()

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  async #refreshToken() {
    return withTimeout(async signal => {
      const url = `${this.#baseUrl}${REFRESH_TOKEN_PATH}`
      const config = {
        method: 'POST',
        credentials: 'include',
        headers: this.#defaultHeaders,
        signal
      }

      const response = await this.#httpClient(url, config)

      if (!response.ok) {
        throw await createError(response)
      }

      return response.json()
    }, this.#timeout)
  }
}
