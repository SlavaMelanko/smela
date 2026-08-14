# Plan: `@smela/contracts` shared package

## Problem

Three categories of values are duplicated across `apps/api` and `packages/ui`
with no compile-time or test-time guard against drift:

1. **Enums** — `Role`, `UserStatus`
   - `apps/api/src/types/role.ts`, `apps/api/src/types/user-status.ts` (TS
     `enum`)
   - `packages/ui/src/lib/types/role.js`,
     `packages/ui/src/lib/types/userStatus.js` (plain object, JS)
   - The runtime values currently match, but each side can change them
     independently. Different local helper functions are intentional and are not
     contract drift.

2. **Validation bounds** — name/description length, password strength regex,
   email format regex, and (found during audit, 2026-08-09) **position** and
   **website** bounds
   - `apps/api/src/routes/rules.ts`
   - `packages/ui/src/lib/validation/constants.js` /
     `packages/ui/src/lib/validation/rules.js`
   - Password regex and email regex were just manually re-synced (2026-08-09) —
     copy-paste with a "keep in sync" comment, no enforcement.
   - **`position` (job title) is already drifted, not just duplicated**: ui
     (`rules.js:72-80`) validates it as 2–50 by reusing `NameConstraint` (the
     person/entity-name bound); api (`rules.ts:81`) validates it as 0–100
     (`max(100)`, no minimum). These are different business rules — `position`
     was never actually a "name" field, it just borrowed `NameConstraint`
     because a min/max constant already existed. A user can enter a 1-character
     position that api accepts and ui rejects, or (once synced) ui would
     incorrectly demand a minimum api never enforced.
   - **`website` bound exists only on api**: api (`rules.ts:79`) caps it at
     `z.url().max(255)`; ui's `rules.url()` helper (`rules.js:56-60`) has no
     length cap at all — a URL over 255 characters passes client-side validation
     and is rejected only by the api.
   - **`search` (team list filter, `rules.ts:82`, `max(100)`)** was audited and
     is api-only: the ui uses a plain `SearchInput` with no validation schema.
     It therefore stays local until a second consumer exists.

3. **Error codes** — `ErrorCode` enum
   - `apps/api/src/errors/codes.ts` (source of truth)
   - Consumed as untyped `backend.<code>` string literals in
     `packages/ui/src/services/backend/error.js`,
     `packages/ui/src/pages/auth/Login/Notice.jsx`, and as `backend.*` i18n keys
     in `packages/i18n/src/resources/{en,uk}.json`.
   - A backend rename breaks web silently — no compile or test failure.

Per architecture decision already recorded (2026-06-08): **do not** import
`apps/api/src/**` into `apps/web`/`packages/ui` directly — that points the
dependency the wrong way across the API's app boundary. Both sides must depend
_down_ on something neither owns.

## Decision

Create `packages/contracts` (`@smela/contracts`), a runtime-dependency-free
package holding only the **raw values that api and ui must not be allowed to
disagree on**. No helper functions, no framework code (no Zod, no i18n).

### What moves in

`Role`, `UserStatus`, and `ErrorCode` move in as TS `enum`s (see "Language"
below) — unchanged in kind from how api already declares them today, just
relocated.

Validation bounds move in as **semantic, per-field constants** — grouped by what
the field actually _is_, not by which numbers currently happen to match. Reusing
a generic `NameConstraint` for an unrelated field (e.g. `position`) merely
because the bounds coincided is exactly how the `position` drift above happened,
so contracts must not repeat that pattern:

| Contract                | Shape                                | Used for                                                                                                                                   |
| ----------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `NameConstraint`        | `{ MIN_LENGTH: 2, MAX_LENGTH: 50 }`  | `firstName`, `lastName`, and entity display names (`team.name`, `emailSenderProfile.name`) — confirmed these all share one real rule today |
| `PositionConstraint`    | `{ MAX_LENGTH: 100 }`                | job title / team position — **no minimum**, matching api's actual rule; this is the fix for the drift above                                |
| `WebsiteConstraint`     | `{ MAX_LENGTH: 255 }`                | team website URL — new, currently api-only                                                                                                 |
| `DescriptionConstraint` | `{ MAX_LENGTH: 500 }`                | free-text descriptions                                                                                                                     |
| `PasswordConstraint`    | `{ MIN_LENGTH: 8, STRONG: <regex> }` | password strength; `STRONG` checks composition only, while `MIN_LENGTH` owns length                                                        |
| `EmailConstraint`       | `{ STANDARD: <regex> }`              | email format                                                                                                                               |

Naming note: kept as the existing generic `NameConstraint` rather than renaming
to `PersonNameConstraint`, since it's used for both person names and entity
names today (`displayName` in `rules.ts`/`rules.js` covers `team.name` and
`emailSenderProfile.name` as well as `firstName`/ `lastName`) — a "person" name
would be a misleading label for a field also used on teams and email profiles.
`PositionConstraint`/`WebsiteConstraint` are split out as their own contracts
precisely because they're genuinely different fields, not because of a naming
preference; if entity names and person names ever need different bounds, split
`NameConstraint` into `PersonNameConstraint`/`EntityNameConstraint` then — don't
pre-split now on a hypothetical.

Framework-free TypeScript declarations and constants only — no consumer-specific
helpers or Zod schemas.

### What stays where it is

- **`packages/ui/src/lib/types/role.js`** — keep `isUser`, `isAdmin`, `isOwner`,
  `isUserOrAdmin`. Replace the local `Role` object with
  `import { Role } from '@smela/contracts'` and re-export it so existing
  `from '../types'` call sites don't change.
- **`packages/ui/src/lib/types/userStatus.js`** — keep `allUserStatuses`,
  `userActiveStatuses`, `adminActiveStatuses`. Same treatment for `UserStatus`.
- **`apps/api/src/types/role.ts`** — keep `isUser`, `isAdmin`, `isOwner`,
  `isUserOrAdmin`, re-export `Role` from `@smela/contracts` **as both the named
  and default export**, unchanged from today (see "Preserving type semantics and
  default exports" below — `apps/api/src/types/index.ts` currently does
  `export { default as Role } from './role'`, and other files import the default
  directly).
- **`apps/api/src/types/user-status.ts`** — keep `isActive`, `isNewOrActive`,
  `isActiveOnly`, re-export `UserStatus` from `@smela/contracts` the same way —
  `apps/api/src/use-cases/auth/accept-invite.ts:6` does
  `import UserStatus from '@/types/user-status'` (default import), so the
  default export must survive.
- **`apps/api/src/routes/rules.ts`** — keep all Zod schema construction
  (`z.string().trim().min(...)`), source the numeric bounds and regexes from
  `@smela/contracts`. The email refinement must use `EmailConstraint.STANDARD`
  directly instead of calling `z.email()`; otherwise the api and ui still have
  separate sources of truth. `team.position` changes from
  `z.string().trim().max(100)` to explicitly use `PositionConstraint.MAX_LENGTH`
  (value unchanged, now named/shared instead of a bare literal); `team.website`
  changes from `z.url().max(255)` to
  `z.url().max(WebsiteConstraint.MAX_LENGTH)`.
- **`packages/ui/src/lib/validation/constants.js`** — keep this compatibility
  facade, but re-export every constraint from `@smela/contracts`; it should
  contain no local validation values.
- **`packages/ui/src/lib/validation/rules.js`** — `position` (currently
  `rules.js:72-80`, wrongly bounded by `NameConstraint`) switches to
  `PositionConstraint.MAX_LENGTH` with **no minimum check**, matching api's
  actual rule — this removes the false "position.error.min" validation ui
  currently applies that api never enforced. `url()` (used only for `website`,
  `rules.js:56-60`) gains a length check via `.refine(...)` that it didn't have
  before. Add a dedicated `team.website.error.max` message so format and length
  failures remain distinct.
- **`apps/api/src/errors/codes.ts`** — re-export `ErrorCode` from
  `@smela/contracts` as both named and default
  (`apps/api/src/errors/registry.ts:1` and
  `apps/api/src/handlers/http-status-mapper.ts:1` both do
  `import ErrorCode from './codes'` / `'@/errors/codes'`; `errors/index.ts:2`
  does `export { default as ErrorCode } from './codes'`).
- **`packages/ui/src/services/backend/error.js`** — validate received strings
  against `Object.values(ErrorCode)` before building a `backend.<code>` i18n
  key. Export the same conversion for URL notices.
- **`packages/ui/src/pages/auth/Login/Notice.jsx`** — validate `error` and
  `info` query parameters through the shared backend-code conversion instead of
  interpolating arbitrary query-string values into translation keys.
- **`packages/i18n/src/resources/{en,uk}.json`** — no code change; add a test
  (see below) that asserts every `ErrorCode` value has a `backend.<code>` key in
  each locale file.

This keeps each side's public API (`from '@smela/ui/lib/types'`,
`from '@/types'`) unchanged — only the innermost value source moves.

### Preserving type semantics and default exports

`Role`/`UserStatus` are used as _types_, not just values, throughout api:

```ts
// apps/api/src/middleware/auth/factory.ts
import type { Role, UserStatus } from '@/types'
roleValidator: (role: Role) => boolean
statusValidator: (status: UserStatus) => boolean

// apps/api/src/data/schema/rbac.ts
role: roleEnum('role').notNull().$type<Role>()

// apps/api/src/data/repositories/rbac/types.ts
role: Role
```

**Decision reversed during Phase 2 implementation (2026-08-09):** the plan
originally called for `as const` objects plus a derived union type, reasoning
that JavaScript consumers get an ordinary object and TypeScript consumers get
the exact string union. That is true in isolation, but implementing it surfaced
two real problems, not hypothetical ones:

1. `ts/no-redeclare` (via `@antfu/eslint-config`) flags
   `export const Role = {...} as const` followed by `export type Role = ...` as
   a redeclaration. The rule's `ignoreDeclarationMerge` option does not cover a
   const+type pair — its allow-list is limited to interface/namespace,
   function/module, and enum/module merges (verified by reading the rule source
   in `@typescript-eslint/eslint-plugin`). The only fix is a per-file
   `eslint-disable-next-line`, repeated for every contract.
2. Real regression: switching `Role`/`UserStatus` from `enum` to `as const`
   broke `tsc --noEmit` in `apps/api` — confirmed by diffing against the
   pre-change state (clean, exit 0) versus post-change (exit 2). The break is in
   `apps/api/src/use-cases/owner/admins/__tests__/invites.test.ts:143`:
   `const role = Role.Admin` narrows to the literal type `"admin"` under a plain
   string-literal union, which then makes a `User`-typed mock fixture
   (`role: Role`, the wide type) incompatible with `toEqual`'s inferred expected
   shape. The same narrowing does not fail this way against a nominal `enum`
   type — enums are not structurally identical to a bare string-literal union
   for this inference path, even though `Role.Admin === "admin"` at runtime
   either way.

Kept `enum` instead:

```ts
export enum Role {
  User = 'user',
  Admin = 'admin',
  Owner = 'owner'
}
```

This is what `apps/api/src/types/role.ts` already used before this refactor —
zero-risk by construction, since the values move to contracts unchanged and
every existing type-position usage (type annotations, Drizzle's `$type<Role>()`,
`import type`) keeps working exactly as before. The "plain JS object for JS
consumers" nicety of `as const` is not worth a real `tsc` regression and a
recurring lint suppression; Vite/esbuild transpile `enum` down to an ordinary
runtime object for `packages/ui`/ `apps/web` regardless; there's no observable
difference for JS-side consumers.

Current api source files also expose default runtime exports:

```ts
// apps/api/src/types/role.ts (today)
enum Role {
  User = 'user',
  Admin = 'admin',
  Owner = 'owner'
}
export default Role
```

and call sites depend on the default specifically:

- `apps/api/src/use-cases/auth/accept-invite.ts:6` —
  `import UserStatus from '@/types/user-status'`
- `apps/api/src/errors/registry.ts:1` and
  `apps/api/src/handlers/http-status-mapper.ts:1` —
  `import ErrorCode from './codes'` / `'@/errors/codes'`
- `apps/api/src/types/index.ts` — `export { default as Role } from './role'`,
  `export { default as UserStatus } from './user-status'`
- `apps/api/src/errors/index.ts:2` —
  `export { default as ErrorCode } from './codes'`

Contracts itself only needs named value/type exports—no reason to add a default
export inside `@smela/contracts`. The wrapper files must keep their current
default runtime exports so nothing downstream changes:

```ts
// apps/api/src/types/role.ts (after migration)
import { Role } from '@smela/contracts'

export const isUser = (role: Role) => role === Role.User
export const isAdmin = (role: Role) =>
  role === Role.Admin || role === Role.Owner
export const isOwner = (role: Role) => role === Role.Owner
export const isUserOrAdmin = (role: Role) => isUser(role) || isAdmin(role)

export { Role }
export default Role
```

```ts
// apps/api/src/types/user-status.ts (after migration)
import { UserStatus } from '@smela/contracts'

export const isActive = (status: UserStatus) => /* unchanged */
export const isNewOrActive = (status: UserStatus) => /* unchanged */
export const isActiveOnly = (status: UserStatus) =>
  status === UserStatus.Active

export { UserStatus }
export default UserStatus
```

```ts
// apps/api/src/errors/codes.ts (after migration)
export { ErrorCode as default, ErrorCode } from '@smela/contracts'
```

Step 2 and step 4 of the migration below must include this default-export
preservation explicitly — it's easy to drop by accident when "just
re-exporting."

## Language: TS, single source, no build step

`apps/api` is TypeScript; `packages/ui`/`apps/web` are plain JS but already run
everything through Vite/Vitest, which transpiles TS on the fly. A
JS-plus-hand-written-`.d.ts` split was considered but rejected — it just
relocates the duplication problem one level down (two files must agree on one
shape instead of two packages). Since every consumer already has a TS transpiler
in its toolchain, contracts can just be `.ts` source, no build, no dual files.

**Verified against this repo:**

- `bun run` executes a `.ts` file directly — no compile step, no `dist/`.
- `vitest run`, using `packages/ui`'s actual `vitest.config.js`, imported a
  `.ts` file from inside a `.test.js` file and passed — Vite transpiles it the
  same way it already transpiles JSX/TS elsewhere in the app.
- A sibling `.d.ts` next to a `.js` file _also_ resolves correctly under api's
  `moduleResolution: "bundler"` (tested with the repo's TS 6.0.3) — confirms
  option A would have worked too, but it's unnecessary given the above.

```ts
// packages/contracts/src/role.ts
export enum Role {
  User = 'user',
  Admin = 'admin',
  Owner = 'owner'
}
```

`apps/api` imports this as native TS, same as it imports its own `src/`.
`packages/ui`/`apps/web` import the same file through Vite/Vitest, which
transpiles it on the fly — both sides read the exact same source, single file,
no build step, no `allowJs` change to api's tsconfig.

One caveat: `packages/ui/vitest.config.js`'s `test.include` glob is currently
`**/*.{js,jsx}` only. This doesn't block _importing_ `.ts` (proven above) — it
only matters if a `*.test.ts` file itself needs discovering, which contracts
won't have inside `ui`. If contracts ships its own tests (see skeleton below),
those run via `bun test` inside `packages/contracts`, not through
`packages/ui`'s Vitest config.

## Package skeleton

```text
packages/contracts/
├── package.json
├── src/
│   ├── index.ts
│   ├── role.ts               // export enum Role { ... }
│   ├── user-status.ts        // export enum UserStatus { ... }
│   ├── error-code.ts         // export enum ErrorCode { ... }
│   ├── constraints.ts        // NameConstraint, PositionConstraint,
│   │                         // WebsiteConstraint, DescriptionConstraint,
│   │                         // PasswordConstraint, EmailConstraint
│   └── __tests__/
│       ├── role.test.ts
│       ├── user-status.test.ts
│       └── constraints.test.ts
├── eslint.config.mjs
└── tsconfig.json
```

```json
// packages/contracts/package.json
{
  "name": "@smela/contracts",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "clean": "rm -rf node_modules",
    "format": "prettier --cache --check .",
    "format:fix": "prettier --cache --write .",
    "lint": "eslint --cache src",
    "lint:fix": "eslint --cache --fix src",
    "lint:staged": "lint-staged",
    "tsc": "bunx tsc --noEmit",
    "test": "bun test src",
    "check": "bun run format:fix && bun run lint:fix && bun run tsc && bun run test"
  },
  "devDependencies": {
    "@smela/eslint": "workspace:*",
    "@types/bun": "^1.3.14"
  }
}
```

```js
// packages/contracts/eslint.config.mjs
import { typescriptConfig } from '@smela/eslint/typescript'

export default typescriptConfig()
```

Extracted `typescriptConfig()` into `packages/eslint/src/typescript.js`
(exported as `@smela/eslint/typescript`) during Phase 1 implementation, rather
than each TS package hand-rolling its own `@antfu/eslint-config` call —
`apps/api/eslint.config.mjs` now calls the same helper with its app-specific
overrides layered on. This wasn't part of the original plan but fixes the same
duplication problem one layer down: two TS packages were about to carry the same
antfu options verbatim. `packages/contracts` has no package-local
`eslint.config.ts`/`@antfu/eslint-config` devDependency as a result — see the
real `package.json`/`eslint.config.mjs` above.

Add a package-local `tsconfig.json` with `strict`, `noEmit`,
`moduleResolution: "bundler"`, and `types: ["@types/bun"]`, matching
`apps/api/tsconfig.json`'s field order and options (see the file itself for the
exact shape — they're kept aligned by hand, not generated).

Both `apps/api` and `packages/ui` add:

```json
"dependencies": {
  "@smela/contracts": "workspace:*"
}
```

## Roadmap

Six phases, each sized to roughly 100–200 lines of diff (new files + edits),
each independently shippable and leaving `main`/`dev` green. Do not start phase
_N+1_ until phase _N_'s `bun run check` is clean at the root — each phase is a
separate PR.

### Phase 1 — Scaffold `@smela/contracts` (empty package, ~80 lines)

Get the package wired into the workspace with nothing but a placeholder, so
every later phase is "add a file + two import edits" instead of "add a file

- two import edits + fix the build."

* Create `packages/contracts/package.json`, `tsconfig.json`, `eslint.config.mjs`
  per the skeleton above.
* `src/index.ts` exporting nothing yet (or a single trivial placeholder
  constant, deleted in phase 2) — the point of this phase is proving
  `bun install`, `tsc`, `lint`, and `test` all run clean for the new package
  before it holds anything real.
* Add folder entry to `smela.code-workspace`.
* `bun install` to link the workspace.
* No changes to `apps/api` or `packages/ui` yet.

**Done when:** `bun run --filter @smela/contracts check` passes and
`bun install` resolves the new workspace package with no other package touched.

### Phase 2 — Move `Role` / `UserStatus` (~150 lines)

- `src/role.ts`, `src/user-status.ts` in contracts: `enum` declarations (see
  "Preserving type semantics and default exports" above for why `enum` over
  `as const`), values copied from api's current `role.ts`/`user-status.ts`.
- `apps/api/src/types/role.ts` / `user-status.ts`: replace the local `enum` with
  `import { Role } from '@smela/contracts'` (same for `UserStatus`), keep every
  existing helper (`isUser`, `isAdmin`, `isOwner`, `isUserOrAdmin`, `isActive`,
  `isNewOrActive`, `isActiveOnly`) and both the named and default export
  unchanged.
- `packages/ui/src/lib/types/role.js` / `userStatus.js`: same treatment — import
  the object from contracts, keep local helpers
  (`allUserStatuses`/`userActiveStatuses`/`adminActiveStatuses`) as-is.
- Run both `__tests__` suites next to these files to confirm nothing broke.

**Done when:** `bun run check` is green in both `apps/api` and `packages/ui`;
grepping either package for a locally-declared `Role =` or `UserStatus =` object
finds nothing outside `@smela/contracts`.

### Phase 3 — Add validation constants to contracts (~120 lines)

Contracts-only phase — no api/ui call sites change yet, so this phase carries
zero behavior-change risk and can be reviewed purely on "are the constants
right."

- `src/constraints.ts`: `NameConstraint`, `PositionConstraint`,
  `WebsiteConstraint`, `DescriptionConstraint`, `PasswordConstraint`
  (`MIN_LENGTH` + `STRONG`, composition-only regex — no `{8,}` baked in),
  `EmailConstraint` (`STANDARD`). Values sourced from api's current `rules.ts`,
  since it has the correct bound for every field including `position` (100, no
  minimum) and `website` (255).
- `__tests__/constraints.test.ts`: table tests with representative accepted and
  rejected values for `PasswordConstraint.STRONG` and `EmailConstraint.STANDARD`
  — testing the declared policy, not equivalence with `z.email()`.

**Done when:** `bun run --filter @smela/contracts check` passes with the new
file; no other package imports it yet.

### Phase 4 — Wire api to the new validation constants (~130 lines)

- `apps/api/src/routes/rules.ts`: replace every inline bound (`displayName`'s
  `min(2).max(50)`, `firstName`/`lastName`'s `min(2).max(50)`, `description`'s
  `max(500)`, `team.position`'s `max(100)`, `team.website`'s `max(255)`) with
  the matching `@smela/contracts` constant. Replace `PASSWORD_REGEX` and the
  `z.email()` refinement with `PasswordConstraint`/`EmailConstraint` directly.
  Leave `team.search`'s `max(100)` as a local literal — still api-only.
- Remove `PASSWORD_REGEX` from `apps/api/src/security/password/index.ts` once
  `rules.ts` no longer imports it from there.
- Drop the `// Keep in sync with packages/ui/...` comments — no longer true once
  contracts is the single source.
- Run `apps/api`'s existing route/rule tests.

**Done when:** `bun run check` is green in `apps/api`; `rules.ts` contains no
bare numeric length literal or inline regex for a field contracts now owns.

### Phase 5 — Wire ui to the new validation constants, fix drift (~170 lines)

This is the phase that actually fixes the `position`/`website` bugs, not just
relocates duplicated code — call it out as such in the PR description.

- `packages/ui/src/lib/validation/constants.js`: re-export every constraint from
  `@smela/contracts`, remove all local values.
- `packages/ui/src/lib/validation/rules.js`:
  - `firstName`/`lastName`/`displayName` keep using `NameConstraint`, unchanged
    behavior, new source.
  - `position`: switch to `PositionConstraint.MAX_LENGTH`, **remove the
    minimum-length `.refine()`** — this is the fix, api never enforced one.
  - `url()`: add a `.refine()` using `WebsiteConstraint.MAX_LENGTH` with a new
    `team.website.error.max` message — ui currently accepts URLs api silently
    rejects; this is a new, intentional restriction.
- `packages/i18n/src/resources/{en,uk}.json`: remove `position.error.min`,
  change `position.error.max`'s copy from implying 50 to 100, add
  `team.website.error.max`.
- Add/update form tests for `position` (no more min-length rejection) and
  `website` (boundary + over-limit rejection).

**Done when:** `bun run check` is green in `packages/ui`; a manual check of the
invite form accepts a 1-character position and the team form rejects a
256-character website with the new message.

### Phase 6 — Move `ErrorCode`, add locale-completeness test (~160 lines)

- `src/error-code.ts` in contracts: values copied from
  `apps/api/src/errors/codes.ts`. Add a contracts test asserting all `ErrorCode`
  values are unique.
- `apps/api/src/errors/codes.ts`: re-export from `@smela/contracts` as both
  named and default
  (`export { ErrorCode as default, ErrorCode } from '@smela/contracts'`). The
  existing default type-only import in `apps/api/src/errors/app-error.ts`
  remains valid because an enum provides both value and type namespaces.
- `packages/ui/src/services/backend/error.js`: validate the received code
  against `Set(Object.values(ErrorCode))` before building the `backend.<code>`
  i18n key; keep the existing fallback for unknown codes.
- `packages/ui/src/pages/auth/Login/Notice.jsx`: route `error`/`info` query
  params through the same validated conversion; `ErrorCode.InternalError`
  fallback for unknown `error`, ignore unknown `info`.
- `packages/i18n`: add `@smela/contracts` as a dev dependency, a locale test
  asserting `resources[locale].translation.backend[code]` exists for every
  `ErrorCode` value in every locale, and wire it into `check`.

**Done when:** `bun run check` is green in `apps/api`, `packages/ui`, and
`packages/i18n`; the new i18n test fails if you temporarily comment out one
`backend.*` key (verify this once, then restore it).

### Phase 7 — Cleanup (~20 lines)

- Sweep for any remaining `// Keep in sync` comments made obsolete by phases
  2–6.
- Run `bun run check` at the repo root — every package green.
- Delete this plan document or move its "Problem"/"Decision" sections into a
  permanent doc if the team wants the rationale kept.

## Out of scope / explicitly not moving

- Zod schema construction (`rules.ts`) — stays api-only; contracts has no Zod
  dependency.
- UI-specific i18n error-message strings — stay in `packages/i18n`.
- `EmailSenderProfile`, `Permission`, `Resource`, `Action`, `AuthProvider`,
  `UserPreferences` types — currently api-only, no ui counterpart exists, so no
  duplication to fix. Revisit only if ui grows a need for one of these.

**Correction from initial draft (2026-08-09 audit):** this section originally
listed `website`/`position`/`search` bounds as "api-only, no ui duplication
today" and out of scope. That was wrong for `position` and `website` — both
already have ui counterparts with **different, drifted** values (see the Problem
section and step 3 above), not merely "no ui version yet." Only `search`
(`rules.ts:82`) is genuinely api-only today, so its bound stays in the api until
the ui or another consumer needs the same rule.

## Follow-up outside this plan

- `packages/e2e` is missing from `smela.code-workspace` (pre-existing gap,
  unrelated to this plan) — worth fixing separately.
