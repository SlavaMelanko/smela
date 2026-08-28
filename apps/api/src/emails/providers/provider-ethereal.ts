import type { Transporter } from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'

import nodemailer from 'nodemailer'

import type { EmailMessage, EmailProvider, EmailSendInfo } from './provider'

export class EtherealEmailProvider implements EmailProvider {
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>

  constructor(
    host: string | undefined,
    port: number | undefined,
    username: string | undefined,
    password: string | undefined
  ) {
    if (!host || !port || !username || !password) {
      throw new Error(
        'Ethereal email configuration is required for development.'
      )
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false, // use TLS
      auth: {
        user: username,
        pass: password
      }
    })
  }

  async send(msg: EmailMessage): Promise<EmailSendInfo> {
    const info = await this.transporter.sendMail({
      from: `${msg.from.name} <${msg.from.email}>`,
      to: Array.isArray(msg.to) ? msg.to.join(', ') : msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text
    })

    const previewUrl = nodemailer.getTestMessageUrl(info)

    return {
      msg: 'Ethereal email sent',
      subject: msg.subject,
      messageId: info.messageId,
      previewUrl: previewUrl || 'No preview URL available',
      to: msg.to
    }
  }
}
