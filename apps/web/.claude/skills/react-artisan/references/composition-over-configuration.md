# Composition Over Configuration

**Never build "god components" with many conditional props.** They violate SOLID
principles and become maintenance nightmares.

## The Problem

```jsx
// ❌ Avoid: monolithic component with inline markup and conditionals
export const TeamPageHeader = ({
  name,
  website,
  description,
  email,
  avatar
}) => (
  <div className='flex items-center gap-3'>
    <div className='flex size-10 items-center justify-center'>
      <Users className='size-8 text-primary' />
    </div>
    <div>
      <p className='text-2xl font-semibold'>{name}</p>
      {website && (
        <a href={website} className='text-sm'>
          {website}
        </a>
      )}
      {description && (
        <p className='text-sm text-muted-foreground'>{description}</p>
      )}
      {email && <a href={`mailto:${email}`}>{email}</a>}
      {avatar && <img src={avatar} alt={name} />}
    </div>
  </div>
)
```

**Why this fails:**

- **Interface Segregation violation** — consumers see props irrelevant to their
  use case
- **Open/Closed violation** — adding features requires modifying the component
- **Conditional hell** — grows into unreadable if-else chains over time

## The Solution: Tiny Building Blocks

Create small, single-responsibility primitives. Let consumers compose them.

```jsx
// ✅ Prefer: composable building blocks (shadcn pattern)
export const PageHeader = ({ children }) => (
  <div className='flex items-center gap-3'>{children}</div>
)

export const PageHeaderIcon = ({ icon: Icon }) => (
  <div className='flex size-10 items-center justify-center'>
    <Icon className='size-8 text-primary' />
  </div>
)

export const PageHeaderContent = ({ children }) => <div>{children}</div>

export const PageHeaderTitle = ({ children }) => (
  <p className='text-2xl font-semibold'>{children}</p>
)

export const PageHeaderDescription = ({ children }) => (
  <p className='text-sm text-muted-foreground'>{children}</p>
)

export const PageHeaderWebsite = ({ url }) => {
  if (!url) {
    return null
  }

  return (
    <Link
      to={url}
      size='sm'
      underline='none'
      openInNewTab
      className='inline-flex items-center gap-1'
    >
      <Globe className='size-3.5' />
      <span>{url}</span>
    </Link>
  )
}

export const PageHeaderEmail = ({ email }) => {
  if (!email) {
    return null
  }

  return <EmailLink email={email} size='sm' underline='none' />
}
```

## Usage: Compose What You Need

```jsx
// Team page — uses website
export const TeamPageHeader = ({ name, website }) => (
  <PageHeader>
    <PageHeaderIcon icon={Users} />
    <PageHeaderContent>
      <PageHeaderTitle>{name}</PageHeaderTitle>
      <PageHeaderWebsite url={website} />
    </PageHeaderContent>
  </PageHeader>
)

// Settings page — uses description
export const SettingsPageHeader = ({ title, description }) => (
  <PageHeader>
    <PageHeaderIcon icon={Settings} />
    <PageHeaderContent>
      <PageHeaderTitle>{title}</PageHeaderTitle>
      <PageHeaderDescription>{description}</PageHeaderDescription>
    </PageHeaderContent>
  </PageHeader>
)

// User profile — uses email (new requirement, no changes to primitives needed)
export const UserPageHeader = ({ name, email }) => (
  <PageHeader>
    <PageHeaderIcon icon={User} />
    <PageHeaderContent>
      <PageHeaderTitle>{name}</PageHeaderTitle>
      <PageHeaderEmail email={email} />
    </PageHeaderContent>
  </PageHeader>
)
```

## Why This Works

| Principle                 | How it's satisfied                                        |
| ------------------------- | --------------------------------------------------------- |
| **Single Responsibility** | Each primitive does exactly one thing                     |
| **Interface Segregation** | Consumers only see props relevant to their use case       |
| **Open/Closed**           | Extend by adding new primitives (minimizes modifications) |
| **Testability**           | Small primitives are trivial to unit test in isolation    |

**Rule of thumb:** If a component has more than 2-3 conditional renders,
decompose it into primitives.
