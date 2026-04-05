import { UserStatus } from '@ui/lib/types'
import { useState } from 'react'

import { StatusDropdown } from '.'

export default {
  title: 'Components/UserStatus',
  component: StatusDropdown,
  parameters: { layout: 'fullscreen' },
  decorators: [
    Story => (
      <div className='flex items-center justify-center w-full min-h-screen'>
        <Story />
      </div>
    )
  ]
}

const InteractiveStatusDropdown = ({ initialStatus }) => {
  const [status, setStatus] = useState(initialStatus)

  return <StatusDropdown value={status} onChange={setStatus} />
}

export const Default = {
  render: () => <InteractiveStatusDropdown initialStatus={UserStatus.Active} />
}
