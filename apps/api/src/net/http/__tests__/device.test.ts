import { describe, expect, test } from 'bun:test'
import { Hono } from 'hono'

import type { DeviceInfo } from '../device'

import { getDeviceInfo } from '../device'

const app = new Hono().get('/device', c => c.json(getDeviceInfo(c)))

const requestDeviceInfo = async (headers?: Record<string, string>) => {
  const res = await app.request('/device', { headers })

  return (await res.json()) as DeviceInfo
}

describe('getDeviceInfo', () => {
  test('extracts trimmed user agent', async () => {
    const result = await requestDeviceInfo({
      'user-agent': ' Mozilla/5.0 Test Browser '
    })

    expect(result.userAgent).toBe('Mozilla/5.0 Test Browser')
  })

  test('ignores X-Forwarded-For without trusted proxies', async () => {
    const result = await requestDeviceInfo({
      'x-forwarded-for': '192.168.1.1'
    })

    expect(result.ipAddress).toBeNull()
  })

  test('returns null values when headers are missing', async () => {
    expect(await requestDeviceInfo()).toEqual({
      ipAddress: null,
      userAgent: null
    })
  })
})
