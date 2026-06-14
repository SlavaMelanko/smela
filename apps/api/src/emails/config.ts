export interface SocialLink {
  name: string
  url: string
  icon: string
}

export interface EmailConfig {
  companyName?: string
  socialLinks?: SocialLink[]
}

// Runtime cache. Filled by emailAgent at startup and refreshed on owner/admin edits.
// Defaults keep the standalone email preview server working without a DB/env.
export const config = {
  companyName: 'SMELA',
  socialLinks: [] as SocialLink[]
}

export const setConfig = ({ companyName, socialLinks }: EmailConfig): void => {
  if (companyName) {
    config.companyName = companyName
  }

  if (socialLinks) {
    config.socialLinks = socialLinks
  }
}
