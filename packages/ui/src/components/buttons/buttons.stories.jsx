import { AddButton } from './AddButton'
import { BackButton } from './BackButton'
import { InviteButton } from './InviteButton'

const withContainer = Story => (
  <div className='flex items-center gap-4 p-6'>
    <Story />
  </div>
)

export default {
  title: 'Components/Buttons',
  decorators: [withContainer],
  parameters: { layout: 'centered' }
}

export const Add = {
  render: () => (
    <>
      <AddButton label='Add Member' onClick={() => {}} />
      <AddButton
        label='Add Admin'
        onClick={() => {}}
        hideTextOnMobile={false}
      />
    </>
  )
}

export const Invite = {
  render: () => (
    <>
      <InviteButton label='Invite Member' onClick={() => {}} />
      <InviteButton
        label='Invite Admin'
        onClick={() => {}}
        hideTextOnMobile={false}
      />
    </>
  )
}

export const Back = {
  render: () => <BackButton />
}
