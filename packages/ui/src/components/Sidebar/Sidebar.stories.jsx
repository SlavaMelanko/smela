import { CreateTeamDialog } from '@ui/components/dialogs'
import { useModal } from '@ui/hooks/useModal'
import { BookOpen, Bot, Home, Users } from 'lucide-react'
import { useState } from 'react'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '../ui/sidebar'
import { Sidebar } from '.'

const initialTeams = [
  { id: 'kemmer', name: 'Kemmer and Co', position: 'Developer' },
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

const SidebarPreview = ({
  items,
  initialTeams: previewTeams = initialTeams,
  initialInvites = []
}) => {
  const [teams, setTeams] = useState(previewTeams)
  const [pendingInvites, setPendingInvites] = useState(initialInvites)
  const { openModal } = useModal()

  const switchTeam = teamId => {
    setTeams(current =>
      moveToFront(
        current,
        current.find(team => team.id === teamId)
      )
    )
  }

  const createTeam = () => {
    const close = openModal({
      children: (
        <CreateTeamDialog
          onClose={() => close()}
          onSubmit={data => {
            setTeams(current => [
              { ...data, id: crypto.randomUUID() },
              ...current
            ])

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
    <Sidebar
      items={items}
      teams={teams}
      invites={pendingInvites}
      onTeamChange={switchTeam}
      onCreateTeam={createTeam}
      onAcceptInvite={acceptInvite}
      onDeclineInvite={removeInvite}
    />
  )
}

export default {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    initialPath: '/ai-agents/chatgpt'
  },
  decorators: [
    (Story, context) => (
      <SidebarProvider defaultOpen={!context.parameters.sidebarCollapsed}>
        <Story />
        <SidebarInset>
          <SidebarTrigger className='md:hidden' />
        </SidebarInset>
      </SidebarProvider>
    )
  ]
}

export const AllFeatures = {
  render: args => <SidebarPreview {...args} />,
  args: {
    items: [
      { title: 'sidebar.home', url: '/home', icon: Home },
      {
        title: 'AI agents',
        icon: Bot,
        items: [
          { title: 'ChatGPT', url: '/ai-agents/chatgpt' },
          { title: 'Claude Code', url: '/ai-agents/claude-code' },
          { title: 'Copilot', url: '/ai-agents/copilot' }
        ]
      },
      { title: 'sidebar.users', url: '/users', icon: Users, badge: 5 },
      {
        title: 'sidebar.documentation',
        url: 'https://google.com',
        icon: BookOpen,
        external: true
      }
    ]
  }
}

export const Collapsed = {
  ...AllFeatures,
  parameters: { sidebarCollapsed: true }
}

export const NoTeam = {
  ...AllFeatures,
  args: { ...AllFeatures.args, initialTeams: [] }
}

export const NoTeamCollapsed = {
  ...NoTeam,
  parameters: { sidebarCollapsed: true }
}

export const WithInvites = {
  ...AllFeatures,
  args: { ...AllFeatures.args, initialInvites: invites }
}
