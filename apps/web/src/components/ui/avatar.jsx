import { cn } from '@/lib/utils'

function Avatar({ className, ...props }) {
  return (
    <span
      data-slot='avatar'
      className={cn('relative flex shrink-0 rounded-full', className)}
      {...props}
    />
  )
}

function AvatarImage({ src, alt, className, ...props }) {
  return (
    <img
      data-slot='avatar-image'
      src={src}
      alt={alt}
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }) {
  return (
    <span
      data-slot='avatar-fallback'
      className={cn(
        'bg-foreground text-background flex size-full items-center justify-center rounded-full font-medium uppercase',
        className
      )}
      {...props}
    />
  )
}

function AvatarStatus({ color, className, ...props }) {
  return (
    <span
      data-slot='avatar-status'
      className={cn(
        'absolute bottom-0 right-0 size-2 rounded-full ring-1 ring-background',
        color,
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback, AvatarImage, AvatarStatus }
