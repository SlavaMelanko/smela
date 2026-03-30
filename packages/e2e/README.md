# Playwright E2E Tests

## ⚠️ Prerequisites

Before running the tests:

1. Seed pre-registered accounts into the database
2. Configure `VITE_E2E_*` credentials in `.env.test` (see `.env.example`)

## 📦 Setup

Install Playwright and browser dependencies (run from the app folder):

```bash
bunx playwright install
```

## 🚀 Running Tests

Run all tests headlessly:

```bash
bun run e2e
```

or run tests in interactive UI mode:

```bash
bun run e2e:web
```

## 📚 References

- [Email verification with Playwright](https://mailisk.com/blog/email-verification-playwright)
