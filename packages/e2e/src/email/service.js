import { MailiskClient } from 'mailisk'

import { emailConfig } from './config'
import { EmailProfile } from './profile'

const BASE_TIMEOUT = 30_000
const POLL_INTERVAL = 1_500

const extractLink = (text, regex) => {
  const match = text.match(regex)

  return match ? match[0] : null
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
      const newEmail = emails.find(email => profile.isNew(email))

      if (newEmail) {
        profile.markSeen(newEmail)

        return newEmail
      }

      await new Promise(res => setTimeout(res, POLL_INTERVAL))
    }

    throw new Error(`The email "${subject}" hasn't been received.`)
  }

  async waitForVerificationEmail(emailAddress, subject = 'Verify your email') {
    const email = await this.#waitForEmail(emailAddress, subject)
    const link = extractLink(
      email.text,
      /https?:\/\/[^ \n]+\/verify-email\?token=[^ \n]+/i
    )

    if (!link) {
      throw new Error('Email verification link not found.')
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
    const link = extractLink(
      email.text,
      /https?:\/\/[^ \n]+\/reset-password\?token=[^ \n]+/i
    )

    if (!link) {
      throw new Error('Reset password link not found.')
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
    const link = extractLink(
      email.text,
      /https?:\/\/[^ \n]+\/accept-invite\?token=[^ \n]+/i
    )

    if (!link) {
      throw new Error('Invite link not found.')
    }

    return {
      link,
      text: email.text,
      html: email.html,
      subject: email.subject
    }
  }
}
