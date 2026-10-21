export default interface UserInviteContent {
  subject: (teamName?: string) => string
  previewText: (inviterName?: string, teamName?: string) => string
  greeting: (nickname?: string) => string
  body: (inviterName?: string, teamName?: string) => string
  ctaInstruction: string
  signInCtaInstruction: string
  ctaText: string
  expiryNotice: string
  signature: (companyName: string) => {
    thanks: string
    who: string
  }
}
