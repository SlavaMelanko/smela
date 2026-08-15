# API

Layered monolithic REST API with authentication and RBAC, focused on security
and modularity.

## 📋 Prerequisites

Besides [root prerequisites](../../README.md#-prerequisites) we need:

- Email service account ([Resend](https://resend.com/) for production,
  [Ethereal](https://ethereal.email/) for development)

See [CI workflow](../../.github/workflows/api-ci-ubuntu.yml) for more details.

## 🛠️ Build and Run

### 1. Install dependencies

```zsh
bun install
```

### 2. Environment setup

See [`.env.example`](.env.example) to configure required variables.

### 3. Database setup

Start the development PostgreSQL container:

```zsh
bun run db:dev:up
```

Run all database setup steps at once (generate → migrate → seed):

```zsh
bun run db:init
```

Or look at [`package.json`](package.json) for individual steps.

### 4. Start development server

```zsh
bun run dev
```

Server will start on <http://localhost:3000> by default.

## 🔌 API Endpoints

See [Postman collection](postman.json) for detailed API endpoints.

## 🔐 JWT Secret Rotation

Two-secret pattern: signing always uses `JWT_SECRET`; verification tries
`JWT_SECRET` first, then falls back to the optional `JWT_SECRET_PREVIOUS`.
Recommended rotation period: 90 days (2-3x longest token lifetime).

1. Generate a new secret and set it as `JWT_SECRET`
2. Move the old secret to `JWT_SECRET_PREVIOUS`
3. Deploy changes
4. Wait the grace period — 37 days (30-day max refresh token lifetime + 7-day
   buffer)
5. Remove `JWT_SECRET_PREVIOUS`

The system works without `JWT_SECRET_PREVIOUS`, so rotation causes zero
breaking changes.
