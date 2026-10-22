export const emailConfig = {
  apiKey: process.env.VITE_MAILISK_API_KEY,
  namespace: process.env.VITE_MAILISK_NAMESPACE,
  domain: `${process.env.VITE_MAILISK_NAMESPACE}.mailisk.net`
}

const SUFFIX_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

const generateSuffix = (length = 8) =>
  Array.from(
    crypto.getRandomValues(new Uint8Array(length)),
    byte => SUFFIX_ALPHABET[byte % SUFFIX_ALPHABET.length]
  ).join('')

export const generateEmailAddress = ({
  prefix,
  suffix = generateSuffix()
} = {}) => {
  return `${prefix}.${suffix}@${emailConfig.domain}`.toLowerCase()
}
