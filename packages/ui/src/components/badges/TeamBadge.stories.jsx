import { CreateTeamDialog } from '@ui/components/dialogs'
import { useModal } from '@ui/hooks/useModal'
import { useState } from 'react'

import { TeamBadge } from './TeamBadge'

const initialTeams = [
  { id: 'kemmer', name: 'Kemmer and Co', position: 'Developer' },
  { id: 'engineering', name: 'Engineering', position: 'Team lead' },
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
    <TeamBadge
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
  args: { teams: [initialTeams[0]] }
}

export const NoTeam = {
  render: () => <TeamSwitcherPreview initialTeams={[]} />
}

export const LongName = {
  render: () => (
    <TeamSwitcherPreview
      initialTeams={[
        {
          id: 'long-name',
          name: 'International Engineering and Architecture Leadership Team',
          position: 'Senior Software Engineer and Technical Lead'
        },
        ...initialTeams
      ]}
    />
  )
}
