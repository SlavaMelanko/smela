import { CreateTeamDialog } from '@ui/components/dialogs'
import { useModal } from '@ui/hooks/useModal'
import { useState } from 'react'

import { TeamBadge } from './TeamBadge'

const initialTeams = [
  { id: 'kemmer', name: 'Kemmer and Co', position: 'Developer' },
  { id: 'engineering', name: 'Engineering', position: 'Team lead' },
  { id: 'design', name: 'Design', position: 'Designer' }
]

const TeamSwitcherPreview = () => {
  const [teams, setTeams] = useState(initialTeams)
  const [teamId, setTeamId] = useState(initialTeams[0].id)
  const { openModal } = useModal()

  const createTeam = () => {
    const close = openModal({
      children: (
        <CreateTeamDialog
          onClose={() => close()}
          onSubmit={data => {
            const team = { ...data, id: crypto.randomUUID() }

            setTeams(current => [...current, team])
            setTeamId(team.id)
            close()
          }}
        />
      )
    })
  }

  return (
    <TeamBadge
      team={teams.find(team => team.id === teamId)}
      teams={teams}
      onTeamChange={setTeamId}
      onCreateTeam={createTeam}
    />
  )
}

export default {
  title: 'Components/TeamBadge',
  component: TeamBadge,
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
  args: { team: initialTeams[0] }
}
