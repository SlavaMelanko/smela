import { z } from 'zod'

export const companyEnvVars = {
  COMPANY_NAME: z.string().default('SMELA')
}
