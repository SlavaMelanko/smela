import { CreateTeamDialog } from '@ui/components/dialogs'
import { useModal } from '@ui/hooks/useModal'
import { useState } from 'react'

import { TeamSwitcher } from './TeamSwitcher'

const initialTeams = [
  { id: 'kemmer', name: 'Kemmer and Co', position: 'Developer' },
  {
    id: 'long-name',
    name: 'International Engineering and Architecture Leadership Team',
    position: 'Senior Software Engineer and Technical Lead'
  },
  { id: 'design', name: 'Design', position: 'Designer' }
]

const TeamSwitcherPreview = ({ initialTeams: previewTeams = initialTeams }) => {
  const [teams, setTeams] = useState(previewTeams)
  const { openModal } = useModal()

  const createTeam = () => {
    const close = openModal({
      children: (
        <CreateTeamDialog
          onClose={() => close()}
          onSubmit={data => {
            const team = { ...data, id: crypto.randomUUID() }

            setTeams(current => [team, ...current])
            close()
          }}
        />
      )
    })
  }

  return (
    <TeamSwitcher
      teams={teams}
      onTeamChange={teamId => {
        setTeams(current => [
          current.find(team => team.id === teamId),
          ...current.filter(team => team.id !== teamId)
        ])
      }}
      onCreateTeam={createTeam}
    />
  )
}

export default {
  title: 'Components/TeamSwitcher',
  component: TeamSwitcher,
  parameters: { layout: 'centered' },
  decorators: [
    Story => (
      <div className='w-64'>
        <Story />
      </div>
    )
  ]
}

export const Switcher = {
  render: () => <TeamSwitcherPreview />
}

export const SingleTeam = {
  args: { teams: [initialTeams[0]] }
}

export const NoTeam = {
  render: () => <TeamSwitcherPreview initialTeams={[]} />
}

const invites = [
  {
    id: 'marketing',
    name: 'Marketing',
    inviter: { firstName: 'Jane', lastName: 'Doe' }
  },
  { id: 'sales', name: 'Sales', inviter: null }
]

export const WithInvites = {
  args: { teams: initialTeams, invites }
}

export const InvitesWithoutTeam = {
  args: { teams: [], invites }
}
