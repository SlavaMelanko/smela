# Files and Folders

**Structure files around components, not around file types.** Flat, intentional
organization makes the codebase navigable without a map.

## The Problem

```txt
# ❌ Avoid: type-based grouping and flat dumping
src/
├── components/
│   ├── Header.jsx
│   ├── HeaderDropdown.jsx      # Unclear ownership
│   ├── index.jsx               # Unnamed component file
│   ├── UserSettings.jsx
│   └── UserSettingsForm.jsx    # Belongs with UserSettings
├── hooks/
│   ├── useHeader.js
│   └── useUserSettings.js      # No co-location with component
└── index.js                    # All exports, no grouping
```

**Why this fails:**

- **No co-location** — component and its hooks/tests live in different folders,
  so related files drift apart
- **`index.jsx` as component** — impossible to tell what the file contains
  without opening it; editor tabs all show `index.jsx`
- **Unclear ownership** — `HeaderDropdown.jsx` looks like a top-level component,
  not a detail of `Header`

## The Solution

Group by component, not by file type. Use folder naming to signal intent.

```txt
# ✅ Prefer: component-centric, co-located
src/
├── components/
│   ├── Header/                 # PascalCase = owns a component
│   │   ├── index.js            # Barrel: re-exports only
│   │   ├── Header.jsx
│   │   ├── HeaderDropdown.jsx
│   │   └── useHeader.js        # Co-located hook
│   └── settings/               # lowercase = grouping folder
│       ├── index.js
│       ├── Settings.jsx        # Building blocks (see below)
│       └── UserSettings/
│           ├── UserSettings.jsx
│           └── UserSettingsForm.jsx
```

### Naming Rules

| Item             | Convention                                                 |
| ---------------- | ---------------------------------------------------------- |
| Grouping folder  | `lowercase` (e.g. `settings/`, `form/`)                    |
| Component folder | `PascalCase` (e.g. `Header/`, `DataTable/`)                |
| Component file   | `ComponentName.jsx` — never `index.jsx` for component code |
| Barrel file      | `index.js` — re-exports only, no component code            |
| Test folder      | `__tests__/` inside the component or grouping folder       |
| Story file       | `ComponentName.stories.jsx` or `foldername.stories.jsx`    |

### When to Create a Folder

- **Single file** → flat in grouping folder: `prompts/LoginPrompt.jsx`
- **2+ related files** → folder-per-component: `DataTable/` with its hook/tests

## Building Blocks Pattern

When a grouping folder needs shared primitives across its components, create a
`FolderName.jsx` file. Order components top-to-bottom: containers → primitives.

```jsx
// ✅ form/Form.jsx — shared primitives for the form/ grouping folder
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

## `components/ui/` Exception

Reserved exclusively for shadcn/ui primitives — do not add custom components here.

```bash
# Install shadcn components from apps/web/
npx shadcn@latest add <component>
```

- Uses `function` declarations + default exports (shadcn convention)
- Custom wrappers go in `components/`, **not** `ui/`

## Why This Works

| Principle           | How it's satisfied                                          |
| ------------------- | ----------------------------------------------------------- |
| **Co-location**     | Component, hooks, and tests live together; easy to move     |
| **Scannability**    | `PascalCase/` vs `lowercase/` signals component vs grouping |
| **Discoverability** | Named files instead of `index.jsx` — readable in tabs/grep  |
| **Low coupling**    | Barrel `index.js` controls the public API of each folder    |

**Rule of thumb:** If you can't tell what a file contains from its name alone,
rename it.
