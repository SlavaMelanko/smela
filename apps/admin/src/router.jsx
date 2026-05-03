import { AuthLayout, ErrorLayout, UserLayout } from '@smela/ui/layouts'
import { adminActiveStatuses, Role } from '@smela/ui/lib/types'
import {
  DashboardPage,
  SettingsPage as AdminSettingsPage,
  TeamPage,
  TeamsPage,
  UserPage,
  UsersPage
} from '@smela/ui/pages/admin'
import {
  AcceptInvitePage,
  LoginPage,
  ResetPasswordPage
} from '@smela/ui/pages/auth'
import {
  GeneralErrorPage,
  NetworkErrorPage,
  NotFoundErrorPage
} from '@smela/ui/pages/errors'
import { AdminPage, AdminsPage } from '@smela/ui/pages/owner'
import { ProfilePage } from '@smela/ui/pages/user'
import {
  ErrorBoundary,
  PrivateRoute,
  PublicRoute,
  RootRedirect
} from '@smela/ui/routes'
import { createBrowserRouter, Outlet } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    element: <RootRedirect />,
    path: '/'
  },
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: 'login',
        element: (
          <LoginPage
            options={{ showSignupPrompt: false, showSocialLogin: false }}
          />
        )
      },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'accept-invite', element: <AcceptInvitePage /> }
    ]
  },
  {
    path: '/admin',
    element: (
      <PrivateRoute
        requireStatuses={adminActiveStatuses}
        requireRoles={[Role.Admin, Role.Owner]}
      >
        <UserLayout />
      </PrivateRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      {
        element: (
          <PrivateRoute requirePermissions={['view:users']}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { path: 'users', element: <UsersPage /> },
          { path: 'users/:id', element: <UserPage /> }
        ]
      },
      {
        element: (
          <PrivateRoute requirePermissions={['view:teams']}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { path: 'teams', element: <TeamsPage /> },
          { path: 'teams/:id', element: <TeamPage /> }
        ]
      },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <AdminSettingsPage /> }
    ]
  },
  {
    path: '/owner',
    element: (
      <PrivateRoute
        requireStatuses={adminActiveStatuses}
        requireRoles={[Role.Owner]}
      >
        <UserLayout />
      </PrivateRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { path: 'admins', element: <AdminsPage /> },
      { path: 'admins/:id', element: <AdminPage /> }
    ]
  },
  {
    path: 'errors',
    element: <ErrorLayout />,
    children: [
      { path: 'general', element: <GeneralErrorPage /> },
      { path: 'network', element: <NetworkErrorPage /> }
    ]
  },
  {
    path: '*',
    element: <ErrorLayout />,
    children: [{ path: '*', element: <NotFoundErrorPage /> }]
  }
])
