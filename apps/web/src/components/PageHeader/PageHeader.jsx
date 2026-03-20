import { Globe } from 'lucide-react'

import { Link } from '@/components/links'
import { EmailLink } from '@/components/links/EmailLink'
import { cn } from '@/lib/utils'

export const PageHeader = ({ children }) => (
  <div className='flex items-end justify-between'>{children}</div>
)

export const PageHeaderGroup = ({ children, className }) => (
  <div className={cn('flex items-center gap-3', className)}>{children}</div>
)

export const PageHeaderIcon = ({ icon: Icon }) => (
  <div className='flex size-10 items-center justify-center'>
    <Icon className='size-8 text-primary' />
  </div>
)

export const PageHeaderContent = ({ children }) => <div>{children}</div>

export const PageHeaderTitle = ({ children }) => (
  <h1 className='text-2xl font-semibold'>{children}</h1>
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
