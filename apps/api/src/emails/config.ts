import { env } from './env'

export interface EmailConfig {
  company: {
    name: string
  }
}

const createEmailConfig = (): EmailConfig => {
  return {
    company: {
      name: env.companyName
    }
  }
}

export const config = createEmailConfig()
