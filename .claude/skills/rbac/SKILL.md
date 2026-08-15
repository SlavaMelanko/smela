---
name: rbac
description:
  Access control (RBAC/PBAC) patterns for smela. Triggers - role, permission,
  access control, auth guard, protected route, admin route, 401, 403, forbidden,
  requirePermission, PrivateRoute, requireAdminAuth, requireOwnerAuth,
  action:resource, server.ts, router.jsx, permission.ts.
---

# RBAC + PBAC Skill

## Quick Reference

- **Model**: Two-layer defense — role/status gate → permission gate
- **Permission format**: `"action:resource"` strings (`view:users`,
  `manage:teams`)
- **Backend gate files**: `apps/api/src/middleware/auth/`,
  `apps/api/src/middleware/require-permission/`
- **Frontend gate file**: `packages/ui/src/routes/guards/PrivateRoute.jsx`
- **Permission enum**: `apps/api/src/types/permission.ts`
- **JWT claims type**: `apps/api/src/security/jwt/claims/user.ts`

---

## Layer 1: Role + Status Gate

Applies to entire route groups. Rejects wrong role or status before any handler
runs.

### Backend — `apps/api/src/server.ts`

```typescript
this.createRouteGroup('/api/v1/user', userRoutesAllowNew, requireUserAuth)
this.createRouteGroup(
  '/api/v1/user/verified',
  userRoutesVerifiedOnly,
  requireVerifiedUserAuth
)
this.createRouteGroup('/api/v1/admin', adminRoutes, requireAdminAuth)
this.createRouteGroup('/api/v1/owner', ownerRoutes, requireOwnerAuth)
```

| Middleware                | Roles allowed      | Statuses allowed             |
| ------------------------- | ------------------ | ---------------------------- |
| `requireUserAuth`         | User, Admin, Owner | New, Verified, Trial, Active |
| `requireVerifiedUserAuth` | User, Admin, Owner | Verified, Trial, Active      |
| `requireAdminAuth`        | Admin, Owner       | Active only                  |
| `requireOwnerAuth`        | Owner              | Active only                  |

### Frontend — `apps/admin/src/router.jsx`, `apps/web/src/router.jsx`

```jsx
<PrivateRoute
  requireStatuses={adminActiveStatuses}
  requireRoles={[Role.Admin, Role.Owner]}
>
  <UserLayout />
</PrivateRoute>
```

Implemented by `useHasAccess` in `packages/ui/src/hooks/useHasAccess.js` —
checks `status`, `role`, and `permissions` from the current user context.

---

## Layer 2: Permission Gate

Applies per endpoint (backend) or per route (frontend). Checks a specific
capability.

### Backend — per endpoint in route index files

```typescript
adminTeamsRoute.get(
  '/teams',
  validateQuery(getTeamsQuerySchema),
  requirePermission(Permission.ViewTeams),
  getTeamsHandler
)
```

`requirePermission` reads `c.get('user').permissions` (set by Layer 1
middleware) and throws `Forbidden` if the permission string is absent.

### Frontend — per route or route group

```jsx
// Per route
{ path: 'dashboard', element: <PrivateRoute requirePermissions={['view:dashboard']}><DashboardPage /></PrivateRoute> }

// Per group via Outlet
{
  element: <PrivateRoute requirePermissions={['view:users']}><Outlet /></PrivateRoute>,
  children: [
    { path: 'users', element: <UsersPage /> },
    { path: 'users/:id', element: <UserPage /> }
  ]
}
```

### Permission enum — `apps/api/src/types/permission.ts`

Enum members follow `ViewX`/`ManageX` naming mapping to `view:x`/`manage:x`
values — see the file for the current list.

**Implicit grant rule**: `manage:X` implies `view:X`. `expandPermissions()`
inserts synthetic `view` rows when resolving from DB — so never grant `view`
separately if `manage` is already present.

---

## Layer 3: UI Progressive Disclosure

No route guard — same page, conditional rendering based on permission.

```jsx
const { canAll } = useCurrentUser()

{
  canAll(['manage:users']) && <EditButton />
}
```

Use this for action controls (edit, delete, invite buttons) that live on a page
already guarded by `view:X`.

---

## JWT Claims Shape

```typescript
// apps/api/src/security/jwt/claims/user.ts
type UserClaims = {
  id: string // UUID
  email: string
  role: Role // 'user' | 'admin' | 'owner'
  status: UserStatus
  permissions?: string[] // e.g. ['view:users', 'manage:teams']
}
```

**How permissions reach the JWT:**

1. Login/token refresh calls `resolvePermissionList()` → queries DB
2. Result embedded in JWT via `createAccessToken()`
3. Each request: Layer 1 middleware verifies JWT, sets `c.set('user', claims)`
4. Layer 2 middleware reads `c.get('user').permissions`

**Stale-by-design**: permissions snapshot at token issuance. Revocation takes
effect after access token expires (15 min default). Acceptable for most cases;
do not rely on instant revocation.

---

## Adding a New Protected Route

**API side** (`apps/api/src/routes/admin/` or `owner/`):

1. Add route to appropriate index file
2. Add `requirePermission(Permission.ViewX)` for read endpoints
3. Add `requirePermission(Permission.ManageX)` for write endpoints
4. Place permission middleware after validation, before handler

**Frontend side** (`apps/admin/src/router.jsx` or `apps/web/src/router.jsx`):

1. Add route under the correct `PrivateRoute` role/status group
2. Wrap in `<PrivateRoute requirePermissions={['view:x']}>` (or use `<Outlet />`
   for groups)
3. Use `canAll(['manage:x'])` inside components for action controls

---

## What NOT to Guard

- **Auth routes** (`/api/v1/auth/*`, `/login`, `/signup`, etc.) — public, no
  JWT, no user context
- **`profile` and `settings` routes** — personal preferences, no resource
  ownership, no permission needed
- **Error pages** — unguarded by design
