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

export interface EmailSendInfo {
  msg: string
  subject: string
  messageId: string
  previewUrl: string
  to: string | string[]
}

export interface EmailProvider {
  send: (msg: EmailMessage) => Promise<EmailSendInfo | void>
}
