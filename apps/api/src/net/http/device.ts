import type { Context } from 'hono'

import { getClientIp } from './client-ip'

export interface DeviceInfo {
  ipAddress: string | null
  userAgent: string | null
}

export const getDeviceInfo = (c: Context): DeviceInfo => ({
  ipAddress: getClientIp(c) ?? null,
  userAgent: c.req.header('user-agent')?.trim() || null
})
