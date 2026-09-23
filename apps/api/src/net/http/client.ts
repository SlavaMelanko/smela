import { AppError, ErrorCode } from '@/errors'

import { makeUrl, removeTrailingSlash } from '../url'

/**
 * Wraps an async function with a timeout mechanism using AbortController.
 * If the function doesn't complete within the specified timeout, the promise
 * will be rejected with a timeout error.
 *
 * @param asyncFn - The async function to execute
 * @param timeoutMs - Timeout in milliseconds (default: 10 seconds)
 * @returns Promise that resolves with the function result or rejects on timeout
 * @throws Throws 'Timeout.' error when the timeout is exceeded
 */
const withTimeout = async <T>(
  asyncFn: () => Promise<T>,
  timeoutMs: number = 10000
): Promise<T> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const result = await Promise.race([
      asyncFn(),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () =>
          reject(new Error('Timeout.'))
        )
      })
    ])

    return result
  } finally {
    clearTimeout(timeoutId)
  }
}

export type Headers = Record<string, string>
export type Body = string | FormData | URLSearchParams

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Headers
  body?: Body
  timeout?: number
}

export interface HttpClientOptions {
  headers?: Headers
  timeout?: number
}

export class HttpClient {
  private readonly baseUrl: string
  private readonly defaultOptions: Required<HttpClientOptions>

  constructor(baseUrl: string, defaultOptions: HttpClientOptions = {}) {
    this.baseUrl = removeTrailingSlash(baseUrl)
    this.defaultOptions = {
      headers: defaultOptions.headers ?? {},
      timeout: defaultOptions.timeout ?? 10000
    }
  }

  async get<T = any>(path: string, headers?: Headers): Promise<T> {
    return this.request<T>(path, { method: 'GET', headers })
  }

  async post<T = any>(
    path: string,
    body?: Body,
    headers?: Headers
  ): Promise<T> {
    return this.request<T>(path, { method: 'POST', body, headers })
  }

  async put<T = any>(path: string, body?: Body, headers?: Headers): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body, headers })
  }

  async delete<T = any>(path: string, headers?: Headers): Promise<T> {
    return this.request<T>(path, { method: 'DELETE', headers })
  }

  private async request<T = any>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = makeUrl(this.baseUrl, path)
    const timeout = options.timeout ?? this.defaultOptions.timeout

    const config: RequestInit = {
      method: options.method || 'GET',
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers
      }
    }

    if (options.body) {
      config.body = options.body
    }

    const response = await withTimeout(async () => fetch(url, config), timeout)

    if (!response.ok) {
      throw new AppError(
        ErrorCode.InternalError,
        `API request failed: ${response.status} ${response.statusText}`
      )
    }

    return response.json() as Promise<T>
  }
}
