---
name: social-auth
description:
  End-to-end recipe for integrating a social auth provider (Google, GitHub,
  Facebook, etc.) across apps/api and apps/web. Use when adding a new OAuth
  provider, reviewing social-login code, or debugging the OAuth callback flow.
  Triggers on AuthProvider, OAuth redirect/callback handlers, provider services,
  "Continue with X" buttons, and account linking.
---

# Social Auth Integration Skill

## Overview

Adds a new OAuth provider end-to-end using the **authorization-code flow with a
server-side token exchange**. The browser never sees a token: the backend sets
an httpOnly refresh cookie, the frontend exchanges it for an access token via
`/refresh-token`.

Google is the reference implementation. To add GitHub/Facebook/etc., copy each
Google touchpoint and swap provider-specific bits (auth URL, token endpoint,
userinfo shape, scopes). The architecture stays identical.

### Why this flow

- **No token in URL** — avoids leaking tokens into history/logs.
- **One `users` row per verified email** — email is the identity anchor;
  multiple `auth` rows hang off it (one per provider). Same email via different
  providers links to the same account.
- **`prompt=select_account`** — always let the user pick which account.

## Integration map (Google reference)

Work top-to-bottom. Each row is one provider's touchpoint.

### Backend (`apps/api`)

| #   | File                                          | What                                                                                                                                                |
| --- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `src/types/auth-providers.ts`                 | Add enum member (e.g. `Github = 'github'`)                                                                                                          |
| 2   | `src/data/schema/auth.ts`                     | `authProviderEnum` auto-derives from `AuthProvider`; no edit unless changing the CHECK                                                              |
| 3   | `src/env/services.ts`                         | Export `<provider>OAuthEnvVars` (client id/secret, redirect URI, state cookie name + max-age)                                                       |
| 4   | `src/env/env.ts`                              | Spread the new env vars into the schema                                                                                                             |
| 5   | `src/errors/codes.ts`                         | Add `<Provider>OAuthCancelled/Failed/InvalidState`, reuse `SocialAuthOnly` / `GoogleEmailNotVerified`-style codes                                   |
| 6   | `src/errors/registry.ts`                      | Add messages for each new code                                                                                                                      |
| 7   | `src/handlers/http-status-mapper.ts`          | Map codes → HTTP status (cancelled→400, invalid-state→400, failed→502, email-not-verified→403, social-auth-only→409)                                |
| 8   | `src/services/<provider>/oauth.ts`            | `buildAuthUrl(state)`, `exchangeCodeForProfile(code)` → `{ id, email, firstName, lastName }`. Provider-specific endpoints + Zod-validated responses |
| 9   | `src/services/<provider>/index.ts`            | Re-export `buildAuthUrl`, `exchangeCodeForProfile`, profile type                                                                                    |
| 10  | `src/net/http/cookie/<provider>-oauth.ts`     | `set/get/delete<Provider>StateCookie` (httpOnly, sameSite lax, `secure: !isDevOrTestEnv()`)                                                         |
| 11  | `src/net/http/cookie/index.ts`                | Re-export the cookie helpers                                                                                                                        |
| 12  | `src/use-cases/auth/<provider>-oauth.ts`      | `logInOrSignUpWith<Provider>` — find-or-create + **account linking by email** + activate `New→Active`; returns `{ data, isNew, refreshToken }`      |
| 13  | `src/routes/auth/<provider>-oauth/handler.ts` | `redirectHandler` (set state, redirect to auth URL) + `callbackHandler` (validate state, exchange code, mint tokens, redirect to FE)                |
| 14  | `src/routes/auth/<provider>-oauth/index.ts`   | Hono route: `GET /<provider>`, `GET /<provider>/callback`                                                                                           |
| 15  | `src/routes/auth/index.ts`                    | Mount the new route                                                                                                                                 |
| 16  | `src/data/repositories/auth/queries.ts`       | `findByProvider` already generic — no change                                                                                                        |
| 17  | `src/data/scripts/seed.ts`                    | Optionally seed a provider-only user (no `passwordHash`, `identifier` = provider account id)                                                        |

### Frontend (`apps/web` + `packages/ui`)

| #   | File                                                                       | What                                                                                                                                                                  |
| --- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 18  | `packages/ui/src/services/backend/paths.js`                                | Add `<PROVIDER>_OAUTH_PATH = '/api/v1/auth/<provider>'`                                                                                                               |
| 19  | `packages/ui/src/hooks/useAuth.js`                                         | `useLoginWith<Provider>` + `useUserSignupWith<Provider>` (both just `window.location.href = BE_BASE_URL + PATH`); reuse `useCompleteGoogleLogin` pattern for callback |
| 20  | `packages/ui/src/pages/auth/<Provider>OAuthCallback/`                      | Callback page: call refresh-token, navigate `/home` with `showWelcome: isNew`, on error → `/login?error=<code>`                                                       |
| 21  | `apps/web/src/router.jsx`                                                  | Add `auth/<provider>/callback` route under AuthLayout                                                                                                                 |
| 22  | `packages/ui/src/pages/auth/Login/LoginPage.jsx` + `Signup/SignupPage.jsx` | Add "Continue with X" button + provider icon                                                                                                                          |
| 23  | `packages/ui/src/components/icons`                                         | Add provider icon                                                                                                                                                     |
| 24  | `packages/i18n`                                                            | Add `continueWith<Provider>` + any error-code translations (edit `packages/i18n/src/resources/` only)                                                                 |

## Key patterns (copy these exactly)

### The provider service contract

```ts
// services/<provider>/oauth.ts
export interface ProviderProfile {
  id: string // stable provider account id — stored as auth.identifier
  email: string
  firstName: string
  lastName?: string
}

export const buildAuthUrl = (state: string): string => {
  const params = new URLSearchParams({
    client_id: env.PROVIDER_CLIENT_ID,
    redirect_uri: env.PROVIDER_REDIRECT_URI,
    response_type: 'code',
    scope: '<provider scopes>',
    prompt: 'select_account', // always let the user choose the account
    state // CSRF nonce, verified in callback
  })

  return `${AUTH_URL}?${params}`
}

export const exchangeCodeForProfile = async (
  code: string
): Promise<ProviderProfile> => {
  // 1. POST code → provider token endpoint
  // 2. GET userinfo with access token
  // 3. Zod-validate both responses; throw AppError(ErrorCode.<Provider>OAuthFailed) on mismatch
  // 4. reject unverified email → ErrorCode.<Provider>EmailNotVerified
}
```

### Account linking (the part most likely to get wrong)

```ts
// use-cases/auth/<provider>-oauth.ts — find-or-create
const existingAuth = await authRepo.findByProvider(
  AuthProvider.Provider,
  providerId
)
if (existingAuth) {
  const user = await userRepo.findById(existingAuth.userId)
  if (user) return { user, isNew: false }
}

const user = await db.transaction(async tx => {
  // Link by email — user may already exist (e.g. signed up with password)
  let user = await userRepo.findByEmail(email, tx)
  if (!user) {
    user = await userRepo.create(
      { firstName, lastName, email, status: UserStatus.Active },
      tx
    )
  }
  await authRepo.create(
    {
      userId: user.id,
      provider: AuthProvider.Provider,
      identifier: providerId
    },
    tx
  )
  await rbacRepo.setUserPermissions(
    user.id,
    getSelfServeUserDefaultPermissions(),
    tx
  )
  // Provider account implies verified email → activate
  if (user.status === UserStatus.New) {
    user = await userRepo.update(user.id, { status: UserStatus.Active }, tx)
  }
  return user
})
```

### Mint tokens WITH permissions (regression source — see PR #141)

Every auth path that mints tokens must pass resolved permissions, or the JWT
`permissions` claim is `undefined` and the frontend route guard throws "Access
denied".

```ts
const permissions = await resolvePermissionList(user.id)
const [accessToken, refreshToken] = await createAuthTokens(
  user,
  deviceInfo,
  permissions
)
return { data: { user, permissions, accessToken }, refreshToken }
```

Audit all of: `login`, `signup`, `verify-email`, `reset-password`,
`accept-invite`, `refresh-token`, and every `*-oauth` use-case.

### Callback handler skeleton

```ts
// redirect: set state cookie, send user to provider
export const redirectHandler = c => {
  const state = crypto.randomUUID()
  setProviderStateCookie(c, state)
  return c.redirect(buildAuthUrl(state), HttpStatus.MOVED_TEMPORARILY)
}

// callback: validate, exchange, mint, redirect to FE
export const callbackHandler = async c => {
  const { code, state, error } = c.req.query()
  if (error || !code || !state) return c.redirect(errorRedirect(OAuthCancelled))
  if (!isValidState(c, state)) return c.redirect(errorRedirect(InvalidState))
  try {
    const profile = await exchangeCodeForProfile(code)
    const result = await logInOrSignUpWithProvider(
      { ...profile },
      getDeviceInfo(c)
    )
    setRefreshCookie(c, result.refreshToken)
    return c.redirect(callbackRedirect(result.isNew)) // ?new=1 when isNew
  } catch (err) {
    const reason = err instanceof AppError ? err.code : ErrorCode.InternalError
    return c.redirect(errorRedirect(reason))
  }
}
```

### Frontend hook + callback

```js
// hooks/useAuth.js — kicks off the redirect, identical for login & signup
export const useLoginWithProvider = () =>
  useMutation({
    mutationFn: async () => {
      window.location.href = `${env.BE_BASE_URL}${PROVIDER_OAUTH_PATH}`
    }
  })

// Callback page — exchange httpOnly cookie for access token, then route
completeProviderLoginAsync()
  .then(() =>
    navigate('/home', { replace: true, state: { showWelcome: isNew } })
  )
  .catch(error =>
    navigate(withQuery('/login', { error: error?.code }), { replace: true })
  )
```

> The "Continue with X" button is intentionally **login-or-signup on both
> `/login` and `/signup`** — OAuth is idempotent. Don't redirect to `/signup`.

## Auth provider behavior matrix

| Scenario                                   | Behavior                                                |
| ------------------------------------------ | ------------------------------------------------------- |
| Provider signup → provider login again     | Idempotent — logs in, `isNew: false`, no welcome toast  |
| Email signup → provider OAuth (same email) | Links provider auth to existing account; `New → Active` |
| Provider-only account → email login        | `SocialAuthOnly` (409) — no password on the account     |
| Email signup → email login                 | Normal flow                                             |
| Provider OAuth from login page (new user)  | Registers + logs in, `isNew: true`                      |

## Env setup checklist

1. Provider developer console: create OAuth app, set **Authorized redirect URI**
   to `http://localhost:3000/api/v1/auth/<provider>/callback` (and prod).
2. Add to `apps/api/.env.development`: `PROVIDER_CLIENT_ID`,
   `PROVIDER_CLIENT_SECRET` (redirect URI + cookie vars have defaults).
3. Document in `.env.example`.
4. Dev uses **real** provider credentials — no mock. Use a real account at
   consent. Provider caches consent: re-prompt by revoking access in the
   provider's account settings, or use an incognito window.

## Testing

### Reachable without a real OAuth round-trip (write these as E2E)

Seed a provider-only user (no `passwordHash`) in `seed.ts`, then in
`apps/web/e2e/auth.spec.js` under a `Authentication: <Provider> OAuth`
`describe`:

- **Provider-only account → email login → `SocialAuthOnly` (409)**
- **Email signup for an existing provider account → `EmailAlreadyInUse` (409)**
- **Callback with missing session → redirect `/login` with neutral notice**

Follow the `e2e-testing` skill. Use `waitForApiCall` on `LOGIN_PATH` /
`SIGNUP_PATH` / `REFRESH_TOKEN_PATH` with the expected `HttpStatus`.

### Requires a real round-trip (manual until an OAuth mock seam exists)

These need a valid `code` exchanged server-side, which Playwright can't fake:

- Happy-path provider signup (new user, welcome toast)
- Email signup → provider OAuth account linking
- Provider OAuth from login page registers a new user

To automate later: add a test-only stub of `exchangeCodeForProfile` gated by an
env flag that returns a canned profile keyed off the `code`. Keep these as a
manual testing checklist meanwhile.

### Backend unit tests

Mock `@/data` including `rbacRepo.findUserPermissions` (the permissions-claim
fix depends on it). Follow the `api-testing` skill. Test the use-case's
find-or-create + linking branches and each error path in
`exchangeCodeForProfile`.

## Gotchas

- **Missing permissions claim** → "Access denied" on `/home`. Pass `permissions`
  to `createAuthTokens` everywhere (PR #141).
- **State cookie** must be `secure: !isDevOrTestEnv()` or it won't round-trip in
  dev.
- **`identifier`** stores the provider account id (e.g. Google `sub`), **not**
  the email. Email lives on the `users` row.
- **CHECK constraint** in `auth.ts`: non-local providers must have
  `password_hash IS NULL`; local must have it set.
- **i18n**: edit only `packages/i18n/src/resources/` — other locale files are
  copies.
