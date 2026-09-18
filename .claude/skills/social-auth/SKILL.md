---
name: social-auth
description:
  Recipe for adding a social auth provider across apps/api and apps/web.
  Triggers - OAuth, social login, Google login, GitHub login, Facebook login,
  "Continue with", AuthProvider, callback, redirect URI, token exchange,
  authorization code, account linking, client ID, client secret.
---

# Social Auth Integration

Reference implementation: Google OAuth (PR #139). To add a provider, copy each
Google touchpoint and swap the provider-specific bits — the architecture is
identical.

## The flow

Authorization-code flow with a **server-side token exchange**. The browser never
sees a token:

1. FE sends user to `GET /api/v1/auth/<provider>` → backend redirects to
   provider consent (with a CSRF `state` cookie).
2. Provider redirects back to `GET /api/v1/auth/<provider>/callback?code&state`.
3. Backend validates `state`, exchanges `code` for the user profile, finds or
   creates the user, sets an **httpOnly refresh cookie**, redirects to the FE
   callback page (`?new=1` when newly registered).
4. FE callback page calls `/refresh-token` to swap the cookie for an access
   token, then routes to `/home`.

**Identity rule:** one `users` row per verified email; one `auth` row per
provider hangs off it. Same email via a different provider **links** to the same
account.

## Integration checklist

### Backend (`apps/api/src`)

- `types/auth-providers.ts` — add enum member (`Github = 'github'`). The pg enum
  in `data/schema/auth.ts` auto-derives; no schema edit.
- `env/services.ts` + `env/env.ts` — export `<provider>OAuthEnvVars` (client
  id/secret, redirect URI, state-cookie name + max-age) and spread into schema.
- `errors/codes.ts` + `errors/registry.ts` + `handlers/http-status-mapper.ts` —
  add `<Provider>OAuthCancelled/Failed/InvalidState`. Reuse generic
  `SocialAuthOnly`. Status map: cancelled/invalid-state→400, failed→502,
  email-not-verified→403, social-auth-only→409.
- `services/<provider>/oauth.ts` (+ `index.ts`) — `buildAuthUrl(state)` and
  `exchangeCodeForProfile(code)`; Zod-validate provider responses.
- `net/http/cookie/<provider>-oauth.ts` (+ `index.ts`) — state cookie
  get/set/delete.
- `use-cases/auth/<provider>-oauth.ts` — `logInOrSignUpWith<Provider>`:
  find-or-create + link-by-email + promote `New→Verified`. A provider proves
  email ownership only; `Active` is for subscribed users.
- `routes/auth/<provider>-oauth/` (`index.ts` with inline handlers) + mount in
  `routes/auth/index.ts`.
- `data/scripts/seed.ts` — optionally seed a provider-only user for E2E.

### Frontend (`packages/ui` + `apps/web`)

- `services/backend/paths.js` — `<PROVIDER>_OAUTH_PATH`.
- `hooks/useAuth.js` — `useLoginWith<Provider>` / `useUserSignupWith<Provider>`
  (both just `window.location.href = BE_BASE_URL + PATH`); reuse the
  `useCompleteGoogleLogin` pattern for the callback.
- `pages/auth/<Provider>OAuthCallback/` — callback page.
- `apps/web/src/router.jsx` — `auth/<provider>/callback` route.
- `pages/auth/Login` + `Signup` — "Continue with X" button + icon.
- `packages/i18n/src/resources/` — `continueWith<Provider>` + error strings
  (edit source resources only; other locales are copies).

## Patterns that matter

**Account linking** — find by provider id first; else link by email:

```ts
const existingAuth = await authRepo.findByProvider(AuthProvider.Provider, providerId)
if (existingAuth) return { user: await userRepo.findById(existingAuth.userId), isNew: false }

// link by email — user may already exist (e.g. signed up with a password)
let user = await userRepo.findByEmail(email, tx) ?? await userRepo.create({ ..., status: Verified }, tx)
await authRepo.create({ userId: user.id, provider: AuthProvider.Provider, identifier: providerId }, tx)
if (user.status === UserStatus.New) user = await userRepo.update(user.id, { status: Verified }, tx)
```

**Always mint tokens WITH permissions** (PR #141 regression) — every auth path
must resolve and pass permissions, or the JWT claim is `undefined` → "Access
denied" on `/home`:

```ts
const permissions = await resolvePermissionList(user.id)
const [accessToken, refreshToken] = await createAuthTokens(
  user,
  deviceInfo,
  permissions
)
```

Audit all token-minting paths: `login`, `signup`, `verify-email`,
`reset-password`, `accept-invite`, `refresh-token`, `*-oauth`.

**Auth URL** — include `prompt=select_account` so the user can pick the account.

**The "Continue with X" button is login-or-signup on both `/login` and
`/signup`** — OAuth is idempotent; don't redirect between them.

## Gotchas

- `auth.identifier` stores the **provider account id** (e.g. Google `sub`), not
  the email. CHECK constraint: non-local providers must have `password_hash`
  NULL.
- State cookie needs `secure: !isDevOrTestEnv()` to round-trip in dev.
- Provider-only account attempting **email login** → `SocialAuthOnly` (409).
  Email signup for an existing account's email → `EmailAlreadyInUse` (409).

## Testing (see `e2e-testing` + `api-testing` skills)

E2E-able without a real round-trip (seed a provider-only user):

- provider-only account → email login → `SocialAuthOnly`
- email signup for existing provider email → `EmailAlreadyInUse`
- callback with missing session → redirect `/login` with neutral notice

Needs a real round-trip (manual until an `exchangeCodeForProfile` stub exists):
happy-path signup, email→provider linking, provider OAuth from the login page.

### Resetting your own account between manual runs

Re-testing signup needs the email free again. This frees it without deleting
the old row — the account is parked on a `+timestamp` alias, which Gmail and
most providers deliver to the same inbox, so verification mail still arrives:

```sql
DO $$
DECLARE
  v_local  TEXT := 'your.name';
  v_domain TEXT := 'gmail.com';
  v_email  TEXT := v_local || '@' || v_domain;
  v_ts     TEXT := to_char(now(), 'YYYYMMDDHH24MISS');
  v_uid    UUID;
BEGIN
  SELECT id INTO v_uid FROM users WHERE email = v_email;

  IF v_uid IS NULL THEN
    RAISE NOTICE 'User not found: %', v_email;
  ELSE
    DELETE FROM auth
    WHERE user_id = v_uid AND provider = 'google';

    UPDATE auth
    SET identifier = v_local || '+' || v_ts || '@' || v_domain,
        updated_at = now()
    WHERE user_id = v_uid AND provider = 'local';

    UPDATE users
    SET email      = v_local || '+' || v_ts || '@' || v_domain,
        status     = 'new',
        updated_at = now()
    WHERE id = v_uid;

    RAISE NOTICE 'Reset done. Archived email: %+%@%', v_local, v_ts, v_domain;
  END IF;
END $$;
```

Why each statement:

- **Deleting the provider `auth` row is required.** Lookup is by provider
  account id (Google `sub`), not email — that id never changes, so leaving the
  row makes the next sign-in find the *old* user instead of running signup.
- **Renaming the `local` identifier** keeps it unique; its `identifier` is the
  email, and `(provider, identifier)` is the primary key.
- **No `user_permissions` delete needed** — `setUserPermissions` is idempotent
  (grants with `onConflictDoNothing`, revokes anything outside the set).

Caveats: the local password account moves to the alias with the user, so the
freed address has no password login until you sign up again. Each run leaves
another parked row; clean them out periodically.
