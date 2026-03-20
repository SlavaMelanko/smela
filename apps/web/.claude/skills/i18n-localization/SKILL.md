---
name: i18n-localization
description: |
  Internationalization and localization patterns. Detecting hardcoded strings,
  managing translations, locale files, RTL support.
---

# i18n & Localization

## Core Concepts

| Term   | Meaning                                               |
| ------ | ----------------------------------------------------- |
| i18n   | Internationalization - designing for multiple locales |
| L10n   | Localization - adapting for a specific locale         |
| Locale | Language + region code (e.g., `en-US`, `uk-UA`)       |
| RTL    | Right-to-left text direction (Arabic, Hebrew)         |

## Implementation Patterns

### Translation Function `t()`

Use `t()` for all user-facing strings:

```jsx
import { useLocale } from '@/hooks/useLocale'

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
public/
└── locales/
    ├── en.json    # English translations
    └── uk.json    # Ukrainian translations
```

Locale files are in `public/` because i18next's `HttpBackend` fetches them at
startup (see `src/i18n.js`). This keeps translations out of the JS bundle and
allows loading only the needed language.

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
python .claude/skills/i18n-localization/scripts/i18n_checker.py
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

**Location**: `.claude/skills/i18n-localization/scripts/i18n_checker.py`

**Usage**:

```bash
# Check current directory
python .claude/skills/i18n-localization/scripts/i18n_checker.py

# Check specific path
python .claude/skills/i18n-localization/scripts/i18n_checker.py /path/to/project
```
