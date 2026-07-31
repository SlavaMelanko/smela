---
name: i18n
description: |
  Internationalization and localization patterns. Detecting hardcoded strings,
  managing translations, locale files, RTL support.
---

# i18n & Localization

## Implementation Patterns

### Translation Function `t()`

Use `t()` for all user-facing strings:

```jsx
import { useLocale } from '@ui/hooks/useLocale'

const MyComponent = () => {
  const { t } = useLocale()

  return <h1>{t('page.title')}</h1>
}
```

### Error Translation `te()`

Use `te()` for translating errors with automatic fallback:

```jsx
const { te } = useLocale()

// Attempts to translate error, falls back to 'error.unknown'
showToast(te(error))

// Custom fallback key
showToast(te(error, 'error.network'))
```

How it works:

1. `toBackendError(error)` converts `AppError` to `backend.{code}` key
2. `toTranslationKey()` checks if key exists in translation file
3. Returns existing key or fallback

## File Structure

```txt
packages/i18n/src/resources/   # SOURCE OF TRUTH — edit only here
├── en.json                    # English translations
└── uk.json                    # Ukrainian translations
```

**Only edit `packages/i18n/src/resources/`.** The locale files in
`apps/web/public/locales/` and `apps/admin/public/locales/` are generated copies
— `bun run sync` in `packages/i18n` distributes them (`sync:watch` for dev).
i18next's `HttpBackend` fetches the copies at startup, keeping translations out
of the JS bundle.

### Translation File Organization

Follow entity-based organization for maintainability:

```json
{
  "role": {
    "name": "Role",
    "values": {
      "admin": "Admin",
      "user": "User"
    }
  },
  "table": {
    "users": {
      "role": "$t(role.name)"
    }
  }
}
```

Key principles:

- **Entity cohesion**: Group related data (e.g., `name` + `values`)
- **Single source of truth**: Define labels once, reference with `$t()`
- **No fragmentation**: Avoid separate objects when entity already exists

## Best Practices

### DO

- Use translation keys for all user-facing text
- Pick user-friendly and warm translations (approachable tone)
- Handle pluralization with i18next plural syntax
- Use `Intl` APIs for date/number formatting
- Plan for RTL support from the start
- Keep keys short, clear, and easy to understand

### DON'T

- Hardcode strings in components
- Concatenate translated strings (word order varies by language)
- Assume text length (German is ~30% longer than English)
- Mix translation and formatting logic

## Common Issues

### Missing Translation

When a key doesn't exist, i18next returns the key itself. Use `te()` for errors
to ensure graceful fallback.

### Hardcoded Strings

Run the checker script to detect untranslated text:

```bash
python .claude/skills/i18n/scripts/i18n_checker.py packages/ui/src
```

### Date/Number Formatting

Use `Intl` APIs instead of hardcoded formats:

```js
// Dates
new Intl.DateTimeFormat(locale).format(date)

// Numbers
new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(
  amount
)
```

## RTL Support

> **TODO**: RTL support not yet implemented. When adding:
>
> - Use CSS logical properties (`margin-inline-start` vs `margin-left`)
> - Add `dir="rtl"` attribute to root element
> - Test with Arabic or Hebrew locale

## Scripts

### i18n Checker

Detects hardcoded strings and missing translations.

**Location**: `.claude/skills/i18n/scripts/i18n_checker.py`

**Usage**:

```bash
# Components and pages live in packages/ui
python .claude/skills/i18n/scripts/i18n_checker.py packages/ui/src

# Check specific path
python .claude/skills/i18n/scripts/i18n_checker.py packages/ui/src/components
```
