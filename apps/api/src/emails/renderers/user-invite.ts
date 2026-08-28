import type { SocialLink } from '../social-links'
import type { UserPreferences } from '../user-preferences'
import type { EmailRenderer, RenderedEmail } from './email-renderer'

import getContent from '../content'
import { getThemeStyles } from '../styles'
import { UserInviteEmail } from '../templates'
import { renderEmail } from './helper'

export interface UserInviteEmailData {
  firstName: string
  inviteUrl: string
  inviterName?: string
  teamName?: string
}

export default class UserInviteEmailRenderer implements EmailRenderer<UserInviteEmailData> {
  async render(
    data: UserInviteEmailData,
    userPreferences?: UserPreferences,
    socialLinks?: SocialLink[]
  ): Promise<RenderedEmail> {
    const content = getContent(userPreferences?.locale).userInvite
    const styles = getThemeStyles(userPreferences?.theme)

    const subject = content.subject(data.teamName)
    const { html, text } = await renderEmail(UserInviteEmail, {
      data,
      content,
      styles,
      socialLinks
    })

    return {
      subject,
      html,
      text
    }
  }
}
