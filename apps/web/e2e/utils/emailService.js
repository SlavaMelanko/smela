import { MailiskClient } from 'mailisk'

const BASE_TIMEOUT = 30000
const POLL_INTERVAL = 1500

export const emailConfig = {
  apiKey: process.env.VITE_MAILISK_API_KEY,
  namespace: process.env.VITE_MAILISK_NAMESPACE,
  domain: `${process.env.VITE_MAILISK_NAMESPACE}.mailisk.net`
}

export const generateEmail = ({ prefix, suffix = Date.now() } = {}) => {
  return `${prefix}.${suffix}@${emailConfig.domain}`.toLowerCase()
}

const extractLink = (text, regex) => {
  const match = text.match(regex)

  return match ? match[0] : null
}

const extractVerificationLink = text =>
  extractLink(text, /https?:\/\/[^ \n]+\/verify-email\?token=[^ \n]+/i)

const extractResetPasswordLink = text =>
  extractLink(text, /https?:\/\/[^ \n]+\/reset-password\?token=[^ \n]+/i)

const extractAcceptInviteLink = text =>
  extractLink(text, /https?:\/\/[^ \n]+\/accept-invite\?token=[^ \n]+/i)

export const hashEmail = email => {
  // Use HTML content as the unique identifier.
  // HTML is more likely to contain unique timestamps or IDs.
  return email.html || email.text // fallback to text if no html
}

class EmailProfile {
  #seenHashes = new Map() // track seen hashes per subject

  isNewEmail(email, subject) {
    const hash = hashEmail(email)

    if (!this.#seenHashes.has(subject)) {
      this.#seenHashes.set(subject, new Set())
    }

    return !this.#seenHashes.get(subject).has(hash)
  }

  markAsSeen(email, subject) {
    const hash = hashEmail(email)

    if (!this.#seenHashes.has(subject)) {
      this.#seenHashes.set(subject, new Set())
    }

    this.#seenHashes.get(subject).add(hash)
  }
}

export class EmailService {
  #client
  #namespace
  #timeout
  #emailProfiles = new Map() // track email profiles per address

  constructor({ apiKey, namespace, timeout = BASE_TIMEOUT } = {}) {
    this.#client = new MailiskClient({ apiKey: apiKey || emailConfig.apiKey })
    this.#namespace = namespace || emailConfig.namespace
    this.#timeout = timeout
  }

  #getProfile(emailAddress) {
    if (!this.#emailProfiles.has(emailAddress)) {
      this.#emailProfiles.set(emailAddress, new EmailProfile())
    }

    return this.#emailProfiles.get(emailAddress)
  }

  async #waitForEmail(emailAddress, subject) {
    const start = Date.now()
    const profile = this.#getProfile(emailAddress)

    while (Date.now() - start < this.#timeout) {
      const { data: emails } = await this.#client.searchInbox(this.#namespace, {
        to_addr_prefix: emailAddress,
        subject_includes: subject
      })

      // Find first email that we haven't seen before
      const newEmail = emails.find(email => profile.isNewEmail(email, subject))

      if (newEmail) {
        profile.markAsSeen(newEmail, subject)

        return newEmail
      }

      await new Promise(res => setTimeout(res, POLL_INTERVAL))
    }

    throw new Error(`The email "${subject}" hasn't been received.`)
  }

  async waitForVerificationEmail(emailAddress, subject = 'Verify your email') {
    const email = await this.#waitForEmail(emailAddress, subject)
    const link = extractVerificationLink(email.text)

    if (!link) {
      throw new Error('Verification link not found in email')
    }

    return {
      link,
      text: email.text,
      html: email.html,
      subject: email.subject
    }
  }

  async waitForResetPasswordEmail(
    emailAddress,
    subject = 'Reset your password'
  ) {
    const email = await this.#waitForEmail(emailAddress, subject)
    const link = extractResetPasswordLink(email.text)

    if (!link) {
      throw new Error('Reset password link not found in email.')
    }

    return {
      link,
      text: email.text,
      html: email.html,
      subject: email.subject
    }
  }

  async waitForInvitationEmail(
    emailAddress,
    // subject parameter does a substring match, so it will match any email
    // with a subject like "You're invited to ACME Corp".
    subject = "You're invited to"
  ) {
    const email = await this.#waitForEmail(emailAddress, subject)
    const link = extractAcceptInviteLink(email.text)

    if (!link) {
      throw new Error('Accept invitation link not found in email.')
    }

    return {
      link,
      text: email.text,
      html: email.html,
      subject: email.subject
    }
  }
}
