---
name: service-integration
description:
  Modular pattern for external service integrations in apps/api. Triggers -
  integration, third-party service, provider, CAPTCHA, payment, Stripe, SMS,
  email service, file storage, S3, analytics, webhook, API key, factory,
  service abstraction, apps/api/src/services.
---

# Service Integration Pattern (apps/api)

Every external service integration follows the same 7-step modular pattern:
isolated module, generic interface, factory instantiation, encapsulated
internals.

## The 7 Steps

1. **Feature isolation** — module under `apps/api/src/services/[service-name]/`:

   ```text
   apps/api/src/services/[service-name]/
   ├── index.ts              # Public API exports only
   ├── [service].ts          # Generic interface
   ├── factory.ts            # Factory method
   ├── config.ts             # General configuration interface
   └── [provider]/           # Provider-specific implementation
   ```

2. **Interface abstraction** — generic interface supporting multiple
   implementations (`interface Captcha { validate(token): Promise<void> }`).
3. **Helper interfaces** — supporting types for configs and data structures.
4. **Concrete implementation** — provider class implements the generic interface
   (`class Recaptcha implements Captcha`).
5. **Factory** — `createCaptchaVerifier(): Captcha` hides which provider is
   chosen.
6. **Encapsulation** — `index.ts` exports the interface type and factory only;
   implementation details stay internal.
7. **Usage** — consumers call the factory and depend on the interface, never on
   a provider class.

## Reference Implementations (read the real code)

- **Simple (single provider)**: `apps/api/src/services/captcha/` — Google
  reCAPTCHA
- **Advanced (multiple providers)**: `apps/api/src/services/email/` — Ethereal +
  Resend with registry pattern and singleton instances

## When to Use

- Integrating any external third-party service or API
- Multiple provider implementations needed (or plausible later)
- Service logic must be mockable in tests — mock the interface, never the
  provider (see `api-testing` skill)
