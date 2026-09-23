export default interface PasswordResetEmailContent {
  subject: string
  previewText: (companyName: string) => string
  greeting: (firstName?: string) => string
  body: string
  ctaText: string
  disclaimer: string
  expiryNotice: string
  signature: (companyName: string) => {
    thanks: string
    who: string
  }
}
