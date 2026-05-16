import {
  AuthLayout,
  ErrorLayout,
  LegalLayout,
  PublicLayout,
  TeamLayout,
  UserLayout
} from '@smela/ui/layouts'
import { Role, userActiveStatuses } from '@smela/ui/lib/types'
import { LoginPage } from '@smela/ui/pages/auth'
import {
  ForbiddenErrorPage,
  GeneralErrorPage,
  NetworkErrorPage,
  NotFoundErrorPage
} from '@smela/ui/pages/errors'
import { PricingPage } from '@smela/ui/pages/public'
import {
  HomePage,
  ProfilePage,
  SettingsPage as UserSettingsPage,
  TeamGeneralPage,
  TeamMemberPage,
  TeamMembersPage
} from '@smela/ui/pages/user'
import {
  ErrorBoundary,
  PrivateRoute,
  PublicRoute,
  RootRedirect
} from '@smela/ui/routes'
import { createBrowserRouter, Navigate } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: '/', element: <RootRedirect /> },
      { path: 'pricing', element: <PricingPage /> }
    ]
  },
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { path: 'login', element: <LoginPage /> },
      {
        path: 'signup',
        lazy: () =>
          import('@smela/ui/pages/auth').then(m => ({
            Component: m.SignupPage
          }))
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
      },
      {
        path: 'email-confirmation',
        lazy: () =>
          import('@smela/ui/pages/auth').then(m => ({
            Component: m.EmailConfirmationPage
          }))
      },
      {
        path: 'verify-email',
        lazy: () =>
          import('@smela/ui/pages/auth').then(m => ({
            Component: m.VerifyEmailPage
          }))
      }
    ]
  },
  {
    element: <LegalLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: 'terms',
        lazy: () =>
          import('@smela/ui/pages/legal').then(m => ({
            Component: m.TermsPage
          }))
      },
      {
        path: 'privacy',
        lazy: () =>
          import('@smela/ui/pages/legal').then(m => ({
            Component: m.PrivacyPage
          }))
      }
    ]
  },
  {
    element: (
      <PrivateRoute
        requireStatuses={userActiveStatuses}
        requireRoles={[Role.User]}
      >
        <UserLayout />
      </PrivateRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { path: 'home', element: <HomePage /> },
      {
        path: 'team',
        element: <TeamLayout />,
        children: [
          { index: true, element: <Navigate to='general' replace /> },
          { path: 'general', element: <TeamGeneralPage /> },
          { path: 'members', element: <TeamMembersPage /> }
        ]
      },
      { path: 'team/members/:id', element: <TeamMemberPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <UserSettingsPage /> }
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
