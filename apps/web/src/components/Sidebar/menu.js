import {
  BookOpen,
  Home,
  LayoutDashboard,
  MapPinCheckInside,
  Settings,
  ShieldCheck,
  User,
  Users
} from 'lucide-react'

import { Role } from '@/lib/types'

export const userMenuItems = [
  {
    title: 'sidebar.home',
    url: '/home',
    icon: Home
  },
  {
    title: 'sidebar.proxies',
    icon: MapPinCheckInside,
    items: [
      { title: 'sidebar.residential', url: '/proxies/residential' },
      { title: 'sidebar.isp', url: '/proxies/isp' },
      { title: 'sidebar.serpApi', url: '/proxies/serp-api' }
    ]
  },
  {
    title: 'sidebar.documentation',
    icon: BookOpen,
    external: true,
    url: 'https://google.com'
  },
  {
    title: 'sidebar.settings',
    url: '/settings',
    icon: Settings
  }
]

export const adminMenuItems = [
  {
    title: 'sidebar.dashboard',
    url: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'sidebar.users',
    url: '/admin/users',
    icon: User
  },
  {
    title: 'sidebar.teams',
    url: '/admin/teams',
    icon: Users
  },
  {
    title: 'sidebar.settings',
    url: '/admin/settings',
    icon: Settings
  }
]

export const ownerMenuItems = [
  {
    title: 'sidebar.dashboard',
    url: '/admin/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'sidebar.users',
    url: '/admin/users',
    icon: User
  },
  {
    title: 'sidebar.teams',
    url: '/admin/teams',
    icon: Users
  },
  {
    title: 'sidebar.admins',
    url: '/owner/admins',
    icon: ShieldCheck
  },
  {
    title: 'sidebar.settings',
    url: '/admin/settings',
    icon: Settings
  }
]

export const menuByRole = {
  [Role.USER]: userMenuItems,
  [Role.ADMIN]: adminMenuItems,
  [Role.OWNER]: ownerMenuItems
}
