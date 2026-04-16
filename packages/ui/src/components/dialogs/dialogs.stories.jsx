import { Dialog, dialogContentVariants } from '@ui/components/ui/dialog'
import { useAdminDefaultPermissions } from '@ui/hooks/useOwner'
import { useTeamMemberDefaultPermissions } from '@ui/hooks/useTeam'

import {
  CreateAdminDialog,
  CreateMemberDialog,
  CreateTeamDialog,
  PricingSliderDialog,
  RemoveTeamMemberDialog
} from '.'

const noop = () => {}

const DialogWrapper = ({ size, children }) => (
  <Dialog open>
    <div className={dialogContentVariants({ size })}>{children}</div>
  </Dialog>
)

export default {
  title: 'Components/Dialogs',
  parameters: { layout: 'centered' },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl']
    }
  },
  args: { size: 'md' }
}

export const RemoveTeamMember = {
  args: { size: 'sm' },
  render: ({ size }) => (
    <DialogWrapper size={size}>
      <RemoveTeamMemberDialog
        member={{ firstName: 'John', lastName: 'Doe' }}
        onClose={noop}
        onConfirm={noop}
      />
    </DialogWrapper>
  )
}

export const CreateTeam = {
  args: { size: 'sm' },
  render: ({ size }) => (
    <DialogWrapper size={size}>
      <CreateTeamDialog onClose={noop} onSubmit={noop} />
    </DialogWrapper>
  )
}

export const CreateMember = {
  args: { size: 'md' },
  beforeEach: () => {
    useTeamMemberDefaultPermissions.mockReturnValue({
      data: {
        users: { view: true, manage: false },
        teams: { view: true, manage: false }
      },
      isPending: false
    })
  },
  render: ({ size }) => (
    <DialogWrapper size={size}>
      <CreateMemberDialog teamId='team_123' onClose={noop} onSubmit={noop} />
    </DialogWrapper>
  )
}

export const CreateAdmin = {
  args: { size: 'md' },
  beforeEach: () => {
    useAdminDefaultPermissions.mockReturnValue({
      data: {
        users: { view: true, manage: true },
        teams: { view: true, manage: true }
      },
      isPending: false
    })
  },
  render: ({ size }) => (
    <DialogWrapper size={size}>
      <CreateAdminDialog onClose={noop} onSubmit={noop} />
    </DialogWrapper>
  )
}

export const PricingSlider = {
  args: { size: 'lg' },
  render: ({ size }) => (
    <DialogWrapper size={size}>
      <PricingSliderDialog onComplete={noop} onClose={noop} />
    </DialogWrapper>
  )
}
