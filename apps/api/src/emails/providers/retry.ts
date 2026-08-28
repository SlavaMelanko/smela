/**
 * Sleeps for the specified number of milliseconds.
 *
 * @param ms - Number of milliseconds to sleep
 * @returns Promise that resolves after the specified delay
 */
export const sleepFor = async (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Calculates exponential backoff delay for retry mechanisms.
 * Each attempt doubles the delay time from the base delay.
 *
 * @param baseDelayMs - Base delay in milliseconds for the first retry
 * @param attempt - Current attempt number (0-based)
 * @param maxDelayMs - Optional maximum delay cap in milliseconds
 * @returns Calculated delay in milliseconds
 *
 * @example
 * exponentialBackoffDelay(1000, 0) // 1000ms
 * exponentialBackoffDelay(1000, 1) // 2000ms
 * exponentialBackoffDelay(1000, 5, 10000) // 10000ms (capped)
 */
export const exponentialBackoffDelay = (
  baseDelayMs: number,
  attempt: number,
  maxDelayMs?: number
): number => {
  const delay = baseDelayMs * 2 ** attempt

  return maxDelayMs ? Math.min(delay, maxDelayMs) : delay
}
