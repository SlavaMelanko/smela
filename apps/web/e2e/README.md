# Playwright E2E Tests

## ⚠️ Prerequisites

Before running the tests:

1. Seed pre-registered accounts into the database
2. Configure `VITE_E2E_*` credentials in `.env.test` (see `.env.example`)

## 📦 Setup

Install Playwright and browser dependencies:

```bash
pnpm exec playwright install
```

## 🚀 Running Tests

Run all tests headlessly:

```bash
pnpm run e2e
```

Or run tests in interactive UI mode:

```bash
pnpm run e2e:ui
```

## 📚 References

- [Email verification with Playwright](https://mailisk.com/blog/email-verification-playwright)
