export default interface EmailVerificationContent {
  subject: string
  previewText: (companyName: string) => string
  greeting: (firstName?: string) => string
  body: string
  ctaText: string
  expiryNotice: string
  disclaimer: string
  signature: (companyName: string) => {
    thanks: string
    who: string
  }
}
