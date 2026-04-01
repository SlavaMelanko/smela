export const emailConfig = {
  apiKey: process.env.VITE_MAILISK_API_KEY,
  namespace: process.env.VITE_MAILISK_NAMESPACE,
  domain: `${process.env.VITE_MAILISK_NAMESPACE}.mailisk.net`
}

export const generateEmailAddress = ({ prefix, suffix = Date.now() } = {}) => {
  return `${prefix}.${suffix}@${emailConfig.domain}`.toLowerCase()
}
