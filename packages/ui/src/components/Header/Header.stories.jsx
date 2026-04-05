import { useCurrentUser, useLogout } from '@ui/hooks/useAuth'
import { allUserStatuses, Role, UserStatus } from '@ui/lib/types'

import { Header } from '.'

export default {
  title: 'Components/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen'
  },
  decorators: [
    Story => (
      <div className='flex w-full shrink-0 items-center z-10 h-11.25 px-4 md:px-8 bg-sidebar border-b border-sidebar-border'>
        <Story />
      </div>
    )
  ],
  argTypes: {
    role: {
      control: 'select',
      options: Object.values(Role)
    },
    status: {
      control: 'select',
      options: allUserStatuses
    }
  },
  args: {
    role: Role.User,
    status: UserStatus.Active
  }
}

export const Default = {
  beforeEach: async context => {
    const { role, status } = context.args

    useCurrentUser.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      user: {
        id: 'usr_12345',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role,
        status
      },
      isAuthenticated: true
    })

    useLogout.mockReturnValue({
      mutate: () => {},
      isPending: false
    })
  }
}

export const Loading = {
  beforeEach: async () => {
    useCurrentUser.mockReturnValue({
      isPending: true,
      isError: false,
      isSuccess: false,
      user: null,
      isAuthenticated: false
    })

    useLogout.mockReturnValue({
      mutate: () => {},
      isPending: false
    })
  }
}
