import { BookOpen, Bot, Home, Users } from 'lucide-react'

import { Sidebar } from '.'

export default {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    initialPath: '/ai-agents/chatgpt'
  },
  decorators: [
    Story => (
      <div className='flex min-h-screen'>
        <Story />
      </div>
    )
  ]
}

export const AllFeatures = {
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
        url: 'https://docs.example.com',
        icon: BookOpen,
        external: true
      }
    ]
  }
}
