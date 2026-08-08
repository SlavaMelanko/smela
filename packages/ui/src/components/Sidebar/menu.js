import {
  BookOpen,
  Cog,
  Home,
  LayoutDashboard,
  MapPinCheckInside,
  Settings,
  ShieldCheck,
  User,
  Users
} from 'lucide-react'

export const getUserMenuItems = () => [
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

export const getAdminMenuItems = () => [
  {
    title: 'sidebar.dashboard',
    url: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'sidebar.users',
    url: '/users',
    icon: User
  },
  {
    title: 'sidebar.teams',
    url: '/teams',
    icon: Users,
    permission: 'view:teams'
  },
  {
    title: 'sidebar.admins',
    url: '/admins',
    icon: ShieldCheck,
    permission: 'view:admins'
  },
  {
    title: 'sidebar.system',
    url: '/system',
    icon: Cog,
    permission: 'view:system'
  },
  {
    title: 'sidebar.settings',
    url: '/settings',
    icon: Settings
  }
]
