export interface EmailMessage {
  to: string | string[]
  from: {
    email: string
    name: string
  }
  subject: string
  html: string
  text: string
}

export type EmailProviderType = 'resend' | 'ethereal' // | etc.

export interface EmailSendInfo {
  provider: EmailProviderType
  messageId: string
  previewUrl?: string
}

export interface EmailProvider {
  send: (msg: EmailMessage) => Promise<EmailSendInfo>
}
