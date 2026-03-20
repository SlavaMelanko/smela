# Files and Folders

**Consistent naming and structure keeps the codebase navigable.** These
conventions apply to all files under `apps/web/src/`.

## Naming

| Item             | Convention                                                 |
| ---------------- | ---------------------------------------------------------- |
| Grouping folder  | `lowercase` (e.g. `settings/`, `form/`)                    |
| Component folder | `PascalCase` (e.g. `Header/`, `DataTable/`)                |
| Component file   | `ComponentName.jsx` — never `index.jsx` for component code |
| Barrel file      | `index.js` — re-exports only, no component code            |
| Test folder      | `__tests__/` inside the component or grouping folder       |
| Story file       | `ComponentName.stories.jsx` or `foldername.stories.jsx`    |

## Flat Structure

Keep nesting shallow. Use the smallest structure that fits the content.

```txt
# ✅ Single component → flat in grouping folder
prompts/
└── LoginPrompt.jsx

# ✅ 2+ related files → folder-per-component
DataTable/
├── index.js
├── DataTable.jsx
└── useDataTable.js

# ✅ Tests → __tests__/ in component or grouping folder
Header/
├── Header.jsx
└── __tests__/
    └── Header.test.jsx
```

## Building Blocks Pattern

When a grouping folder needs shared primitives, create a `FolderName.jsx`
file that exports them. Order components top-to-bottom: containers → primitives.

```jsx
// form/Form.jsx
export const FormRoot = ({ children, className, ...props }) => (
  <form className={cn('flex flex-col gap-8', className)} {...props}>
    {children}
  </form>
)

export const FormLabel = ({ htmlFor, children, optional }) => (
  <label htmlFor={htmlFor}>
    {children}
    {!optional && <span className="ml-1 text-destructive">*</span>}
  </label>
)
```

| Folder          | Building blocks file | Contains                                       |
| --------------- | -------------------- | ---------------------------------------------- |
| `form/`         | `Form.jsx`           | FormRoot, FormFields, FormLabel, FormError     |
| `settings/`     | `Settings.jsx`       | SettingsSection, SettingsLabel, SettingsOption |
| `pages/errors/` | `Error.jsx`          | Shared primitives for sibling error pages      |

## Directory Overview

```txt
apps/web/src/
├── components/
│   ├── Header/              # PascalCase = standalone component
│   │   ├── index.js
│   │   ├── Header.jsx
│   │   └── ProfileDropdown.jsx
│   ├── settings/            # lowercase = grouping folder
│   │   ├── index.js
│   │   ├── Settings.jsx     # Building blocks
│   │   └── DateTimeSettings/
│   ├── LanguageDropdown/
│   │   ├── LanguageDropdown.jsx
│   │   └── flags/           # Domain-specific assets
│   └── ui/                  # shadcn/ui ONLY — see below
├── layouts/
├── pages/
│   ├── errors/
│   │   ├── General/
│   │   ├── NotFound/
│   │   └── Error.jsx        # Building blocks for sibling pages
│   └── admin/Users/
└── hooks/
```

## `components/ui/` Rules

Reserved exclusively for shadcn/ui primitives.

- Install via `npx shadcn@latest add <component>` from `apps/web/`
- Uses regular `function` declarations + default exports (shadcn convention)
- Custom wrappers go in `components/`, **not** `ui/`
