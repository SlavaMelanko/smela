import { AuthLayout, ErrorLayout, UserLayout } from '@smela/ui/layouts'
import { adminActiveStatuses, Role } from '@smela/ui/lib/types'
import {
  DashboardPage,
  EmailSenderProfilePage,
  SettingsPage as AdminSettingsPage,
  SocialLinkPage,
  SystemPage,
  TeamPage,
  TeamsPage,
  UserPage,
  UsersPage
} from '@smela/ui/pages/admin'
import { LoginPage } from '@smela/ui/pages/auth'
import {
  ForbiddenErrorPage,
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
    errorElement: <ErrorBoundary />,
    children: [{ path: '/', element: <RootRedirect /> }]
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
      {
        path: 'reset-password',
        lazy: () =>
          import('@smela/ui/pages/auth').then(m => ({
            Component: m.ResetPasswordPage
          }))
      },
      {
        path: 'accept-invite',
        lazy: () =>
          import('@smela/ui/pages/auth').then(m => ({
            Component: m.AcceptInvitePage
          }))
      }
    ]
  },
  {
    path: '/',
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
      {
        path: 'dashboard',
        element: (
          <PrivateRoute requirePermissions={['view:dashboard']}>
            <DashboardPage />
          </PrivateRoute>
        )
      },
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
      {
        element: (
          <PrivateRoute requirePermissions={['view:system']}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { path: 'system', element: <SystemPage /> },
          {
            path: 'system/email-sender-profiles/:profile',
            element: <EmailSenderProfilePage />
          },
          {
            path: 'system/social-links/:network',
            element: <SocialLinkPage />
          }
        ]
      },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <AdminSettingsPage /> }
    ]
  },
  {
    path: '/',
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
      {
        element: (
          <PrivateRoute requirePermissions={['view:admins']}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { path: 'admins', element: <AdminsPage /> },
          { path: 'admins/:id', element: <AdminPage /> }
        ]
      }
    ]
  },
  {
    path: 'errors',
    element: <ErrorLayout />,
    children: [
      { path: 'forbidden', element: <ForbiddenErrorPage /> },
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
