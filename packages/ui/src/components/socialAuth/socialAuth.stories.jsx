import { AuthMethod, lastAuthMethodStorage } from '@ui/lib/storage'

import { GoogleOAuthButton } from './GoogleOAuthButton'
import { SocialOAuthGroup } from './SocialOAuthGroup'

const withCenteredFrame = Story => (
  <div className='flex min-h-60 w-80 items-center justify-center'>
    <Story />
  </div>
)

export default {
  title: 'Components/SocialAuth',
  decorators: [withCenteredFrame],
  parameters: { layout: 'centered' },
  render: () => (
    <SocialOAuthGroup>
      <GoogleOAuthButton onClick={() => {}} />
    </SocialOAuthGroup>
  )
}

export const Default = {
  beforeEach: () => lastAuthMethodStorage.remove()
}

export const WithLastUsedBadge = {
  beforeEach: () => lastAuthMethodStorage.set(AuthMethod.Google)
}
