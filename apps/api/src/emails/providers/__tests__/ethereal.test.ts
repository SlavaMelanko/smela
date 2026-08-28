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

let mockSendMail: any
let mockCreateTransport: any
let mockGetTestMessageUrl: any

const importProvider = async () => {
  const { EtherealEmailProvider } = await import('../ethereal')

  return EtherealEmailProvider
}

const buildProvider = async () => {
  const EtherealEmailProvider = await importProvider()

  return new EtherealEmailProvider('smtp.ethereal.email', 587, 'user', 'pass')
}

beforeEach(async () => {
  mockSendMail = mock(async () => ({ messageId: 'ethereal-id' }))
  mockCreateTransport = mock(() => ({ sendMail: mockSendMail }))
  mockGetTestMessageUrl = mock(() => 'https://ethereal.email/message/abc')

  await moduleMocker.mock('nodemailer', () => ({
    default: {
      createTransport: mockCreateTransport,
      getTestMessageUrl: mockGetTestMessageUrl
    }
  }))
})

afterEach(async () => {
  await moduleMocker.clear()
})

describe('EtherealEmailProvider', () => {
  describe('constructor', () => {
    it('creates a TLS transport from the given credentials', async () => {
      await buildProvider()

      expect(mockCreateTransport).toHaveBeenCalledWith({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: 'user', pass: 'pass' }
      })
    })

    it.each([
      ['host', [undefined, 587, 'user', 'pass']],
      ['port', ['smtp.ethereal.email', undefined, 'user', 'pass']],
      ['username', ['smtp.ethereal.email', 587, undefined, 'pass']],
      ['password', ['smtp.ethereal.email', 587, 'user', undefined]]
    ])('throws when %s is missing', async (_field, args) => {
      const EtherealEmailProvider = await importProvider()
      const [host, port, username, password] = args as [
        string | undefined,
        number | undefined,
        string | undefined,
        string | undefined
      ]

      expect(
        () => new EtherealEmailProvider(host, port, username, password)
      ).toThrow('Ethereal email configuration is required for development.')
    })
  })

  describe('send', () => {
    it('formats the sender as "name <email>"', async () => {
      const provider = await buildProvider()

      await provider.send(message)

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'SMELA <noreply@smela.me>',
        to: 'user@example.com',
        subject: message.subject,
        html: message.html,
        text: message.text
      })
    })

    it('joins multiple recipients into a comma-separated list', async () => {
      const provider = await buildProvider()

      await provider.send({
        ...message,
        to: ['a@example.com', 'b@example.com']
      })

      expect(mockSendMail.mock.calls[0][0].to).toBe(
        'a@example.com, b@example.com'
      )
    })

    it('returns the message id and preview url', async () => {
      const provider = await buildProvider()

      const info = await provider.send(message)

      expect(info).toEqual({
        provider: 'ethereal',
        messageId: 'ethereal-id',
        previewUrl: 'https://ethereal.email/message/abc'
      })
    })

    it('omits the preview url when nodemailer returns false', async () => {
      mockGetTestMessageUrl.mockReturnValue(false)
      const provider = await buildProvider()

      const info = await provider.send(message)

      expect(info.previewUrl).toBeUndefined()
    })
  })
})
