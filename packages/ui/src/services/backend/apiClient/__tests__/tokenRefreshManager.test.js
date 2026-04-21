import { TokenRefreshManager } from '../tokenRefreshManager'

describe('TokenRefreshManager', () => {
  let manager

  beforeEach(() => {
    manager = new TokenRefreshManager()
  })

  it('should retry request after successful token refresh', async () => {
    const requestFn = vi.fn().mockResolvedValue({ data: 'success' })
    const refreshFn = vi.fn().mockResolvedValue({ accessToken: 'new-token' })

    const result = await manager.refreshAndRetry(requestFn, refreshFn)

    expect(refreshFn).toHaveBeenCalledTimes(1)
    expect(requestFn).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ data: 'success' })
  })

  it('should call onSuccess with access token after refresh', async () => {
    const requestFn = vi.fn().mockResolvedValue({})
    const refreshFn = vi.fn().mockResolvedValue({ accessToken: 'new-token' })
    const onSuccess = vi.fn()

    await manager.refreshAndRetry(requestFn, refreshFn, onSuccess)

    expect(onSuccess).toHaveBeenCalledWith('new-token')
  })

  it('should reject request when refresh fails', async () => {
    const requestFn = vi.fn()
    const refreshFn = vi.fn().mockRejectedValue(new Error('Refresh failed'))
    const onFailure = vi.fn()

    await expect(
      manager.refreshAndRetry(requestFn, refreshFn, null, onFailure)
    ).rejects.toThrow('Refresh failed')

    expect(onFailure).toHaveBeenCalled()
    expect(requestFn).not.toHaveBeenCalled()
  })

  it('should reject when refresh returns no access token', async () => {
    const requestFn = vi.fn()
    const refreshFn = vi.fn().mockResolvedValue({})

    await expect(manager.refreshAndRetry(requestFn, refreshFn)).rejects.toThrow(
      'No access token'
    )
  })

  it('should queue multiple requests and resolve all after single refresh', async () => {
    const requestFn1 = vi.fn().mockResolvedValue({ data: 'first' })
    const requestFn2 = vi.fn().mockResolvedValue({ data: 'second' })
    const refreshFn = vi.fn().mockResolvedValue({ accessToken: 'token' })

    const [result1, result2] = await Promise.all([
      manager.refreshAndRetry(requestFn1, refreshFn),
      manager.refreshAndRetry(requestFn2, refreshFn)
    ])

    expect(refreshFn).toHaveBeenCalledTimes(1)
    expect(result1).toEqual({ data: 'first' })
    expect(result2).toEqual({ data: 'second' })
  })
})
