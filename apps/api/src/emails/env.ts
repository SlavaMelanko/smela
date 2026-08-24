import 'dotenv/config'

interface CompanyEnv {
  companyName: string
}

const createCompanyEnv = (): CompanyEnv => {
  // eslint-disable-next-line node/no-process-env
  const { COMPANY_NAME } = process.env

  return {
    companyName: COMPANY_NAME || 'SMELA'
  }
}

export const env = createCompanyEnv()
