import {
  BookOpen,
  Home,
  MapPinCheckInside,
  Settings,
  Users
} from 'lucide-react'

import { Sidebar } from '.'

export default {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    initialPath: '/proxies/residential'
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
        title: 'sidebar.proxies',
        icon: MapPinCheckInside,
        items: [
          { title: 'sidebar.residential', url: '/proxies/residential' },
          { title: 'sidebar.isp', url: '/proxies/isp' }
        ]
      },
      { title: 'sidebar.users', url: '/users', icon: Users, badge: 5 },
      {
        title: 'sidebar.documentation',
        url: 'https://docs.example.com',
        icon: BookOpen,
        external: true
      },
      { title: 'sidebar.settings', url: '/settings', icon: Settings }
    ]
  }
}
