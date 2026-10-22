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

const invites = [
  {
    id: 'marketing',
    name: 'Marketing',
    inviter: { nickname: 'Janey', firstName: null, lastName: null }
  },
  { id: 'sales', name: 'Sales', inviter: null }
]

const moveToFront = (teams, team) => [
  team,
  ...teams.filter(current => current.id !== team.id)
]

const TeamSwitcherPreview = ({
  initialTeams: previewTeams = initialTeams,
  initialInvites = []
}) => {
  const [teams, setTeams] = useState(previewTeams)
  const [pendingInvites, setPendingInvites] = useState(initialInvites)
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

  const removeInvite = teamId =>
    setPendingInvites(current => current.filter(invite => invite.id !== teamId))

  const acceptInvite = teamId => {
    const invite = pendingInvites.find(current => current.id === teamId)

    setTeams(current =>
      moveToFront(current, { id: invite.id, name: invite.name })
    )

    removeInvite(teamId)
  }

  return (
    <TeamSwitcher
      teams={teams}
      invites={pendingInvites}
      onTeamChange={teamId => {
        setTeams(current =>
          moveToFront(
            current,
            current.find(team => team.id === teamId)
          )
        )
      }}
      onCreateTeam={createTeam}
      onAcceptInvite={acceptInvite}
      onDeclineInvite={removeInvite}
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
  render: () => <TeamSwitcherPreview initialTeams={[initialTeams[0]]} />
}

export const NoTeam = {
  render: () => <TeamSwitcherPreview initialTeams={[]} />
}

export const WithInvites = {
  render: () => <TeamSwitcherPreview initialInvites={invites} />
}

export const InvitesWithoutTeam = {
  render: () => (
    <TeamSwitcherPreview initialTeams={[]} initialInvites={invites} />
  )
}
