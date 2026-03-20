import * as React from 'react'

import { cn } from '@/lib/utils'

function Card({ className, size = 'default', ...props }) {
  return (
    <div
      data-slot='card'
      data-size={size}
      className={cn(
        'ring-foreground/10 bg-card text-card-foreground overflow-hidden rounded-xl p-4 text-sm shadow-xs ring-1 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl group/card flex flex-col',
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot='card-header'
      className={cn(
        'flex items-center justify-between gap-4 [.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4',
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }) {
  return (
    <div
      data-slot='card-title'
      className={cn(
        'text-lg font-semibold leading-normal group-data-[size=sm]/card:text-base',
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }) {
  return (
    <div
      data-slot='card-description'
      className={cn('mt-4 text-muted-foreground text-base', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot='card-action'
      className={cn('shrink-0', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }) {
  return (
    <div data-slot='card-content' className={cn('', className)} {...props} />
  )
}

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot='card-footer'
      className={cn(
        'mt-8 [.border-t]:pt-6 group-data-[size=sm]/card:[.border-t]:pt-4 flex items-center',
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
}
