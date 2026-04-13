import {
  AuthLayout,
  ErrorLayout,
  LegalLayout,
  PublicLayout,
  TeamLayout,
  UserLayout
} from '@smela/ui/layouts'
import { Role, userActiveStatuses } from '@smela/ui/lib/types'
import {
  AcceptInvitePage,
  EmailConfirmationPage,
  LoginPage,
  ResetPasswordPage,
  SignupPage,
  VerifyEmailPage
} from '@smela/ui/pages/auth'
import {
  GeneralErrorPage,
  NetworkErrorPage,
  NotFoundErrorPage
} from '@smela/ui/pages/errors'
import { PrivacyPage, TermsPage } from '@smela/ui/pages/legal'
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
      { path: 'signup', element: <SignupPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'accept-invite', element: <AcceptInvitePage /> },
      { path: 'email-confirmation', element: <EmailConfirmationPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> }
    ]
  },
  {
    element: <LegalLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPage /> }
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
