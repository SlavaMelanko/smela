import {
  BookOpen,
  Cog,
  Home,
  LayoutDashboard,
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
    title: 'sidebar.documentation',
    icon: BookOpen,
    external: true,
    url: 'https://google.com'
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
  }
]
