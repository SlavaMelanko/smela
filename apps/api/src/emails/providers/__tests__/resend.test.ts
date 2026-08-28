import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

import { ModuleMocker } from '@/__tests__'

import type { EmailMessage } from '../provider'

const moduleMocker = new ModuleMocker(import.meta.url)

const message: EmailMessage = {
  to: 'user@example.com',
  from: { email: 'noreply@smela.me', name: 'SMELA' },
  subject: 'Verify your email',
  html: '<p>Verify</p>',
  text: 'Verify'
}

const sent = { data: { id: 'resend-id' }, error: null }
const failed = { data: null, error: { message: 'Rate limited' } }

let mockSend: any
let mockSleepFor: any

const buildProvider = async () => {
  const { ResendEmailProvider } = await import('../resend')

  return new ResendEmailProvider('re_test_key')
}

beforeEach(async () => {
  mockSend = mock(async () => sent)
  mockSleepFor = mock(async () => {})

  await moduleMocker.mock('resend', () => ({
    Resend: class {
      emails = { send: mockSend }
    }
  }))

  await moduleMocker.mock('@/utils/async', () => ({
    sleepFor: mockSleepFor,
    exponentialBackoffDelay: (base: number, attempt: number) =>
      base * 2 ** attempt
  }))
})

afterEach(async () => {
  await moduleMocker.clear()
})

describe('ResendEmailProvider', () => {
  describe('constructor', () => {
    it('throws when the api key is missing', async () => {
      const { ResendEmailProvider } = await import('../resend')

      expect(() => new ResendEmailProvider(undefined)).toThrow(
        'Email configuration is required.'
      )
    })
  })

  describe('send', () => {
    it('formats the sender and wraps a single recipient in an array', async () => {
      const provider = await buildProvider()

      await provider.send(message)

      expect(mockSend).toHaveBeenCalledWith({
        from: 'SMELA <noreply@smela.me>',
        to: ['user@example.com'],
        subject: message.subject,
        html: message.html,
        text: message.text
      })
    })

    it('passes multiple recipients through as-is', async () => {
      const provider = await buildProvider()

      await provider.send({
        ...message,
        to: ['a@example.com', 'b@example.com']
      })

      expect(mockSend.mock.calls[0][0].to).toEqual([
        'a@example.com',
        'b@example.com'
      ])
    })

    it('returns the message id on success without retrying', async () => {
      const provider = await buildProvider()

      const info = await provider.send(message)

      expect(info).toEqual({ provider: 'resend', messageId: 'resend-id' })
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(mockSleepFor).not.toHaveBeenCalled()
    })

    it('retries after a failure and returns the eventual success', async () => {
      mockSend.mockResolvedValueOnce(failed).mockResolvedValueOnce(sent)
      const provider = await buildProvider()

      const info = await provider.send(message)

      expect(info.messageId).toBe('resend-id')
      expect(mockSend).toHaveBeenCalledTimes(2)
    })

    it('backs off exponentially between attempts', async () => {
      mockSend.mockResolvedValue(failed)
      const provider = await buildProvider()

      await provider.send(message).catch(() => {})

      expect(mockSleepFor.mock.calls.map(([ms]: [number]) => ms)).toEqual([
        1000, 2000
      ])
    })

    it('gives up after three attempts and reports the last error', async () => {
      mockSend.mockResolvedValue(failed)
      const provider = await buildProvider()

      const error = await provider.send(message).catch((e: Error) => e)

      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toBe(
        'Failed to send email after 3/3 attempts: Rate limited'
      )
      expect(mockSend).toHaveBeenCalledTimes(3)
    })
  })
})
