import { GoogleIcon } from '@ui/components/icons'
import { useLocale } from '@ui/hooks/useLocale'
import { AuthMethod } from '@ui/lib/storage'

import { SocialOAuthButton } from './SocialOAuthButton'

export const GoogleOAuthButton = props => {
  const { t } = useLocale()

  return (
    <SocialOAuthButton
      provider={AuthMethod.Google}
      icon={<GoogleIcon />}
      label={t('continueWithGoogle')}
      {...props}
    />
  )
}
