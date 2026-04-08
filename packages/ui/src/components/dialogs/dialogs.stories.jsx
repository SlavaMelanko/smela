import { Dialog, dialogContentVariants } from '@ui/components/ui/dialog'

import { PricingSliderDialog, RemoveTeamMemberDialog } from '.'

// Wrapper with Dialog context for Base UI components
const DialogWrapper = ({ size, children }) => (
  <Dialog open>
    <div className={dialogContentVariants({ size })}>{children}</div>
  </Dialog>
)

const noop = () => {}

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

export const PricingSlider = {
  args: { size: 'lg' },
  render: ({ size }) => (
    <DialogWrapper size={size}>
      <PricingSliderDialog onComplete={noop} onClose={noop} />
    </DialogWrapper>
  )
}
