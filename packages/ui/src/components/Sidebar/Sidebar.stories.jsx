import { BookOpen, Bot, Home, Users } from 'lucide-react'
import { useState } from 'react'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '../ui/sidebar'
import { Sidebar } from '.'

const initialTeams = [
  { id: 'kemmer', name: 'Kemmer and Co', position: 'Developer' },
  { id: 'design', name: 'Design', position: 'Designer' }
]

const SidebarPreview = ({ items }) => {
  const [teams, setTeams] = useState(initialTeams)

  const switchTeam = teamId => {
    setTeams(current => [
      current.find(team => team.id === teamId),
      ...current.filter(team => team.id !== teamId)
    ])
  }

  return <Sidebar items={items} teams={teams} onTeamChange={switchTeam} />
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
