import { beforeEach, describe, expect, it } from 'bun:test'
import { Hono } from 'hono'

import type { AppContext } from '@/context'

import { onError } from '@/handlers'
import { HttpStatus } from '@/net/http'

import {
  authRequestSizeLimiter,
  createRequestSizeLimiter,
  fileUploadSizeLimiter,
  generalRequestSizeLimiter
} from '../index'

describe('Request Size Limiter Middleware', () => {
  let app: Hono<AppContext>

  beforeEach(() => {
    app = new Hono<AppContext>()
    app.onError(onError)
  })

  describe('General Request Size Limiter', () => {
    it('should allow requests under 100KB', async () => {
      app.use('*', generalRequestSizeLimiter)
      app.post('/test', c => c.json({ success: true }))

      const payload = JSON.stringify({ data: 'x'.repeat(50000) })
      const res = await app.request('/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': payload.length.toString()
        },
        body: payload
      })

      expect(res.status).toBe(HttpStatus.OK)
      expect((await res.json()).success).toBe(true)
    })

    it('should reject requests over 100KB', async () => {
      app.use('*', generalRequestSizeLimiter)
      app.post('/test', c => c.json({ success: true }))

      const payload = JSON.stringify({ data: 'x'.repeat(150000) })
      const res = await app.request('/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': payload.length.toString()
        },
        body: payload
      })

      expect(res.status).toBe(HttpStatus.REQUEST_TOO_LONG)
      const json = await res.json()
      expect(json.error).toBe('Request body too large.')
      expect(json.code).toBe('request/too-large')
    })

    it('should reject requests with invalid Content-Length header', async () => {
      app.use('*', generalRequestSizeLimiter)
      app.post('/test', c => c.json({ success: true }))

      const res = await app.request('/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': 'invalid'
        },
        body: JSON.stringify({ data: 'test' })
      })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      const json = await res.json()
      expect(json.error).toBe('Invalid Content-Length header.')
      expect(json.code).toBe('request/invalid-content-length')
    })
  })

  describe('Auth Request Size Limiter', () => {
    it('should reject requests over 10KB', async () => {
      app.use('*', authRequestSizeLimiter)
      app.post('/auth/login', c => c.json({ success: true }))

      const payload = JSON.stringify({ padding: 'x'.repeat(11000) })
      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': payload.length.toString()
        },
        body: payload
      })

      expect(res.status).toBe(HttpStatus.REQUEST_TOO_LONG)
      const json = await res.json()
      expect(json.code).toBe('request/too-large')
    })
  })

  describe('File Upload Size Limiter', () => {
    it('should reject files over 5MB', async () => {
      app.use('*', fileUploadSizeLimiter)
      app.post('/upload', c => c.json({ success: true }))

      const fileSize = 6 * 1024 * 1024
      const res = await app.request('/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Content-Length': fileSize.toString()
        },
        body: new ArrayBuffer(fileSize)
      })

      expect(res.status).toBe(HttpStatus.REQUEST_TOO_LONG)
      const json = await res.json()
      expect(json.code).toBe('request/too-large')
    })
  })

  describe('Custom Size Limiter', () => {
    it('should respect custom size limit', async () => {
      const customLimiter = createRequestSizeLimiter({ maxSize: 1024 })
      app.use('*', customLimiter)
      app.post('/test', c => c.json({ success: true }))

      const smallPayload = JSON.stringify({ data: 'x'.repeat(400) })
      const smallRes = await app.request('/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': smallPayload.length.toString()
        },
        body: smallPayload
      })

      expect(smallRes.status).toBe(HttpStatus.OK)

      const largePayload = JSON.stringify({ data: 'x'.repeat(2000) })
      const largeRes = await app.request('/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': largePayload.length.toString()
        },
        body: largePayload
      })

      expect(largeRes.status).toBe(HttpStatus.REQUEST_TOO_LONG)
    })
  })

  describe('Content-Length Mismatch', () => {
    it('should reject when Content-Length does not match actual body size', async () => {
      app.use('*', generalRequestSizeLimiter)
      app.post('/test', c => c.json({ success: true }))

      const payload = JSON.stringify({ data: 'x'.repeat(1000) })
      const res = await app.request('/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '100'
        },
        body: payload
      })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      const json = await res.json()
      expect(json.error).toBe(
        'Content-Length header does not match actual body size.'
      )
      expect(json.code).toBe('request/content-length-mismatch')
    })
  })

  describe('Edge Cases', () => {
    it('should handle Content-Length of 0', async () => {
      app.use('*', generalRequestSizeLimiter)
      app.post('/test', c => c.json({ success: true }))

      const res = await app.request('/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '0'
        },
        body: ''
      })

      expect(res.status).toBe(HttpStatus.OK)
    })

    it('should handle negative Content-Length', async () => {
      app.use('*', generalRequestSizeLimiter)
      app.post('/test', c => c.json({ success: true }))

      const res = await app.request('/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '-1'
        },
        body: JSON.stringify({ data: 'test' })
      })

      expect(res.status).toBe(HttpStatus.BAD_REQUEST)
      const json = await res.json()
      expect(json.code).toBe('request/invalid-content-length')
    })

    it('should skip validation for GET requests', async () => {
      app.use('*', generalRequestSizeLimiter)
      app.get('/test', c => c.json({ success: true }))

      const res = await app.request('/test', { method: 'GET' })

      expect(res.status).toBe(HttpStatus.OK)
    })
  })

  describe('Security', () => {
    it('should reject oversized body when Content-Length header is absent', async () => {
      app.use('*', generalRequestSizeLimiter)
      app.post('/test', c => c.json({ success: true }))

      const res = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'x'.repeat(200000)
      })

      expect(res.status).toBe(HttpStatus.REQUEST_TOO_LONG)
      const json = await res.json()
      expect(json.code).toBe('request/too-large')
    })

    it('should reject oversized body when Content-Length header is falsified', async () => {
      app.use('*', generalRequestSizeLimiter)
      app.post('/test', c => c.json({ success: true }))

      const res = await app.request('/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Content-Length': '100'
        },
        body: 'x'.repeat(200000)
      })

      expect(res.status).toBe(HttpStatus.REQUEST_TOO_LONG)
      const json = await res.json()
      expect(json.code).toBe('request/too-large')
    })
  })
})
