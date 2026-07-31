---
name: e2e-testing
description:
  Use when writing E2E tests with Playwright for apps/web, setting up test
  infrastructure, or debugging flaky browser tests. Invoke for browser
  automation, E2E tests, test flakiness, visual testing.
---

# E2E Testing (apps/web)

## Quick Reference

- **Tests**: `apps/web/e2e/`
- **Shared utilities**: `packages/e2e` (actions, email helpers, config)
- **Config**: `apps/web/playwright.config.js`
- **Run**: `bun run e2e` (or `e2e:ui` for interactive mode) in `apps/web`, uses
  `NODE_ENV=test`

## Project Conventions

- **Component objects over page objects** — small objects per UI component plus
  domain helpers for reusable flows; no heavy page-object class hierarchies.
- **Role-based selectors** first; never CSS class selectors.
- **Fixtures** for setup/teardown; tests stay independent, no shared mutable
  state.
- **No `waitForTimeout()`** — rely on Playwright auto-waiting and web-first
  assertions.
- **No `first()`/`nth()`** without a documented reason.
- Seed data via `apps/api/src/data/scripts/seed.ts` where flows need existing
  users (see `social-auth` skill for examples).
- Flaky test = bug. Debug with traces (`--trace on`) and the trace viewer; never
  ignore or retry-mask.
