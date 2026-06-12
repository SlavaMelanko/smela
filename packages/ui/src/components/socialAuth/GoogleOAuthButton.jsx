import { GoogleIcon } from '@ui/components/icons'
import { AuthMethod } from '@ui/lib/storage'

import { SocialOAuthButton } from './SocialOAuthButton'

export const GoogleOAuthButton = props => (
  <SocialOAuthButton
    provider={AuthMethod.Google}
    icon={<GoogleIcon />}
    label='Google'
    {...props}
  />
)
