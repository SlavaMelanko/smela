export interface EmailPayload {
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
  send: (payload: EmailPayload) => Promise<void>
}
