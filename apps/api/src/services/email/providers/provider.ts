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

export interface EmailProvider {
  send: (msg: EmailMessage) => Promise<void>
}
