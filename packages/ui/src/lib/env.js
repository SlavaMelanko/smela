const makeKey = key => {
  return `VITE_${key}`
}

const getValue = key => {
  return import.meta.env[makeKey(key)]
}

const getRequiredEnv = key => {
  const value = getValue(key)

  if (!value) {
    throw new Error(`Environment variable "${makeKey(key)}" is required`)
  }

  return value
}

const env = {
  MODE: import.meta.env.MODE,
  APP_NAME: getRequiredEnv('APP_NAME'),
  CAPTCHA_SITE_KEY: getRequiredEnv('CAPTCHA_SITE_KEY'),
  BE_BASE_URL: getRequiredEnv('BE_BASE_URL'),
  SENTRY_DSN: getValue('SENTRY_DSN')
}

export default env
