# Source Code Architecture

This document describes the modular architecture and layer organization of the
application.

## Architectural Style

The application follows **Layered Architecture** (also known as Onion
Architecture) with strict dependency rules:

- Each layer can only depend on layers below it
- Lower layers have no knowledge of higher layers
- Dependency flow: Layer 4 → Layer 3 → Layer 2 → Layer 1.5 → Layer 1

## Layer Overview

### 🌐 Layer 4: Presentation (HTTP Interface)

Translates HTTP requests and responses to and from use cases.

- `routes/` - Thin HTTP adapters around use cases, no business logic
- `middleware/` - Cross-cutting HTTP concerns (auth, access control, validation,
  limits, security headers)
- `handlers/` - Global error and not-found handlers

---

### 🎯 Layer 3: Application (Business Workflows)

Orchestrates business workflows on top of infrastructure.

- `use-cases/` - Business logic grouped by audience (auth, user, admin, owner)

Use cases are framework-agnostic and can be called from routes, CLI, background
jobs, or any other interface.

---

### 🔌 Layer 2: Infrastructure (External Integrations)

Integrates with external systems and persists data.

- `services/` - Adapters for external services with no business logic (see the
  `service-integration` skill)
- `data/` - Database access: schemas, repositories, clients, migrations, and
  seeds

---

### 🛠️ Layer 1.5: Technical Capabilities

Reusable infrastructure building blocks.

- `net/` - Networking primitives (HTTP client, cookies, status codes, URLs)
- `security/` - Security primitives (JWT, passwords, one-time tokens)

---

### 🧱 Layer 1: Foundation (Pure Primitives)

Most stable modules, with no internal dependencies (only external packages).

- `env/` - Environment configuration and validation
- `errors/` - Application errors and error codes
- `types/` - Shared domain types
- `utils/` - Generic utilities (see
  [Utils Directory](../AGENTS.md#utils-directory))
- `crypto/` - Low-level cryptographic primitives
- `logging/` - Logger configuration

---

## Special Modules

- `context.ts` - Hono application context types (shared across layers)

---

## Module Dependency Rules

### ✅ Allowed Dependencies

```text
Layer 4 (routes, middleware)
  ↓ can depend on
Layer 3 (use-cases)
  ↓ can depend on
Layer 2 (services, data)
  ↓ can depend on
Layer 1.5 (net, security)
  ↓ can depend on
Layer 1 (env, errors, types, utils, crypto, logging)
  ↓ can depend on
External Packages (npm, bun)
```

> **Note**: Upward dependencies are not allowed. A layer never imports from any
> layer above it.

---

## Architecture Benefits

1. **Maintainability**: Clear separation of concerns, easy to locate code
2. **Testability**: Test business logic without HTTP/database dependencies
3. **Flexibility**: Easy to swap frameworks, databases, or external services
4. **Scalability**: Modular structure supports growth and team collaboration
5. **Reusability**: Foundation and technical layers are highly reusable
6. **Framework Independence**: Business logic has no framework dependencies

---

## Example: Request Flow

```text
1. HTTP Request
   ↓
2. Middleware (Layer 4)
   ↓ (authentication, validation, rate limiting)
3. Route Handler (Layer 4)
   ↓ (extract request data, call use case)
4. Use Case (Layer 3)
   ↓ (business logic, orchestration)
5. Repository / Service (Layer 2)
   ↓ (data access, external calls)
6. Database / External API
   ↓
7. Response flows back up the stack
   ↓
8. HTTP Response
```
