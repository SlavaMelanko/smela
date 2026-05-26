import { test } from '@playwright/test'

export const waitForApiCall = async (page, options, timeout = 30000) => {
  const { path, status, method, validateResponse, validateRequest } = options
  const label = `${method ?? 'ANY'} ${path}`

  return test.step(`Waiting for ${label}`, async () => {
    const response = await page.waitForResponse(
      async response => {
        let matches = response.url().includes(path)

        if (status !== undefined) {
          matches = matches && response.status() === status
        }

        if (method !== undefined) {
          matches = matches && response.request().method() === method
        }

        if (matches && validateRequest) {
          const body = JSON.parse(response.request().postData())
          const valid = await validateRequest(body)

          if (!valid) {
            throw new Error(`Request check failed for ${response.url()}`)
          }
        }

        if (matches && validateResponse) {
          const body = await response.json()
          const valid = await validateResponse(body)

          if (!valid) {
            throw new Error(
              `Response check failed for ${response.url()} (${response.status()})`
            )
          }
        }

        return matches
      },
      { timeout }
    )

    // Return both response and parsed body for further use
    try {
      const body = await response.json()

      return { response, body }
    } catch {
      return { response, body: null }
    }
  })
}

export const waitForApiCalls = async (page, optionsArray, timeout = 30000) => {
  return Promise.all(
    optionsArray.map(options => waitForApiCall(page, options, timeout))
  )
}
