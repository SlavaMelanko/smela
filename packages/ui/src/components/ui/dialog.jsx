import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { cn } from '@ui/lib/utils'
import { cva } from 'class-variance-authority'
import { X } from 'lucide-react'

function Dialog({ ...props }) {
  return <DialogPrimitive.Root data-slot='dialog' {...props} />
}

function DialogPortal({ ...props }) {
  return <DialogPrimitive.Portal data-slot='dialog-portal' {...props} />
}

function DialogBackdrop({ className, ...props }) {
  return (
    <DialogPrimitive.Backdrop
      data-slot='dialog-backdrop'
      className={cn(
        'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
        className
      )}
      {...props}
    />
  )
}

const dialogContentVariants = cva(
  'bg-card text-card-foreground border-border data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-closed:slide-out-to-bottom-4 data-open:slide-in-from-bottom-4 fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 flex flex-col rounded-lg border shadow-lg duration-200 max-h-[90vh] outline-none',
  {
    variants: {
      size: {
        xs: 'w-full max-w-xs',
        sm: 'w-full max-w-sm',
        md: 'w-full max-w-md',
        lg: 'w-full max-w-2xl',
        xl: 'w-full max-w-4xl',
        full: 'w-screen h-screen max-w-none max-h-none rounded-none'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

function DialogContent({ className, size, children, ...props }) {
  return (
    <DialogPrimitive.Popup
      data-slot='dialog-content'
      className={cn(dialogContentVariants({ size }), className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Popup>
  )
}

function DialogHeader({
  className,
  children,
  showCloseButton = true,
  onClose,
  ...props
}) {
  return (
    <div
      data-slot='dialog-header'
      className={cn(
        'flex h-14 items-center justify-between gap-4 border-b border-border px-6',
        className
      )}
      {...props}
    >
      <div className='flex flex-col gap-1'>{children}</div>
      {showCloseButton && (
        <button
          type='button'
          onClick={onClose}
          className='text-muted-foreground hover:text-foreground focus-visible:ring-ring cursor-pointer rounded-full p-1 transition-colors focus-visible:ring-1 focus-visible:outline-none'
          aria-label='Close dialog'
        >
          <X className='size-4' />
        </button>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      data-slot='dialog-title'
      className={cn('text-lg font-semibold text-foreground', className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      data-slot='dialog-description'
      className={cn('text-base text-muted-foreground', className)}
      {...props}
    />
  )
}

function DialogBody({ className, scrollable = true, ...props }) {
  return (
    <div
      data-slot='dialog-body'
      className={cn(
        'flex-1 rounded-b-lg bg-background px-6 py-4',
        scrollable && 'overflow-y-auto overscroll-contain',
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({ className, borderTop = false, ...props }) {
  return (
    <div
      data-slot='dialog-footer'
      className={cn(
        'flex items-center justify-end gap-3 px-6 py-4',
        borderTop && 'border-t border-border',
        className
      )}
      {...props}
    />
  )
}

function DialogControls({ className, ...props }) {
  return (
    <div
      data-slot='dialog-controls'
      className={cn('flex items-center justify-end gap-3 pt-4', className)}
      {...props}
    />
  )
}

function DialogClose({ ...props }) {
  return <DialogPrimitive.Close data-slot='dialog-close' {...props} />
}

export {
  Dialog,
  DialogBackdrop,
  DialogBody,
  DialogClose,
  DialogContent,
  dialogContentVariants,
  DialogControls,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle
}
