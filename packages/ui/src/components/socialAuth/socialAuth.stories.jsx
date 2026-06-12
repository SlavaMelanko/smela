import { AuthMethod, lastAuthMethodStorage } from '@ui/lib/storage'

import { GoogleOAuthButton } from './GoogleOAuthButton'
import { SocialOAuthGroup } from './SocialOAuthGroup'

const withContainer = Story => (
  <div className='w-80 p-6'>
    <Story />
  </div>
)

export default {
  title: 'Components/SocialAuth',
  decorators: [withContainer],
  parameters: { layout: 'centered' }
}

export const Default = {
  render: () => {
    lastAuthMethodStorage.remove()

    return (
      <SocialOAuthGroup>
        <GoogleOAuthButton onClick={() => {}} />
      </SocialOAuthGroup>
    )
  }
}

export const LastUsed = {
  render: () => {
    lastAuthMethodStorage.set(AuthMethod.Google)

    return (
      <SocialOAuthGroup>
        <GoogleOAuthButton onClick={() => {}} />
      </SocialOAuthGroup>
    )
  }
}
