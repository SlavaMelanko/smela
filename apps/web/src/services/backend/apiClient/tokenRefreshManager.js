class PendingRequestQueue {
  #queue = []

  enqueue(callback) {
    this.#queue.push(callback)
  }

  resolve() {
    this.#queue.forEach(callback => callback())
    this.#queue = []
  }

  reject(error) {
    this.#queue.forEach(callback => callback(error))
    this.#queue = []
  }
}

export default class TokenRefreshManager {
  #isRefreshing = false
  #pendingRequests = new PendingRequestQueue()

  /**
   * Queues a request and refreshes the token if not already in progress.
   * All queued requests are retried once the token is refreshed.
   *
   * @param {() => Promise<T>} requestFn - The original request to retry after refresh
   * @param {() => Promise<{accessToken: string}>} refreshFn - Function to refresh the token
   * @param {(accessToken: string) => void} onSuccess - Called with new token on successful refresh
   * @param {() => void} onFailure - Called when refresh fails
   * @returns {Promise<T>} Result of the retried request
   * @template T
   */
  async refreshAndRetry(requestFn, refreshFn, onSuccess, onFailure) {
    const promise = new Promise((resolve, reject) => {
      this.#pendingRequests.enqueue(error => {
        if (error) {
          reject(error)
        } else {
          requestFn().then(resolve).catch(reject)
        }
      })
    })

    if (!this.#isRefreshing) {
      this.#performRefresh(refreshFn, onSuccess, onFailure)
    }

    return promise
  }

  async #performRefresh(refreshFn, onSuccess, onFailure) {
    this.#isRefreshing = true

    try {
      const { accessToken } = await refreshFn()

      if (!accessToken) {
        throw new Error('No access token')
      }

      this.#pendingRequests.resolve()

      if (onSuccess) {
        onSuccess(accessToken)
      }
    } catch (error) {
      console.error(error)

      this.#pendingRequests.reject(error)

      if (onFailure) {
        onFailure()
      }
    } finally {
      this.#isRefreshing = false
    }
  }
}
