import type {
  EmailRenderer,
  RenderContext,
  RenderedEmail
} from './email-renderer'

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
    { company, preferences, socialLinks }: RenderContext
  ): Promise<RenderedEmail> {
    const content = getContent(preferences?.locale).userInvite
    const styles = getThemeStyles(preferences?.theme)

    const subject = content.subject(data.teamName)
    const { html, text } = await renderEmail(UserInviteEmail, {
      data,
      content,
      styles,
      socialLinks,
      company
    })

    return {
      subject,
      html,
      text
    }
  }
}
