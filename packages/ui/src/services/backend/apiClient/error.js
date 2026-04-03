import { HttpStatus } from '@/lib/net'

export const createError = async response => {
  let errorData = {}

  if (!response.bodyUsed) {
    errorData = await response.json().catch(error => {
      console.warn('Failed to parse error response:', error.message)

      return {}
    })
  }

  const error = new Error(
    errorData.error || `Request failed with status ${response.status}`
  )

  error.name = errorData.name || 'AppError'
  error.code = errorData.code || 'system:internal-error'
  error.status = response.status || HttpStatus.INTERNAL_SERVER_ERROR

  return error
}
