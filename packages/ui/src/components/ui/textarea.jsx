import { cn } from '@ui/lib/utils'
import { cva } from 'class-variance-authority'

const textareaVariants = cva(
  'w-full rounded-md border border-border bg-background px-4 py-3 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-[1px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:pointer-events-none disabled:opacity-50 read-only:cursor-text resize-none',
  {
    variants: {
      state: {
        default: '',
        error:
          'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20'
      }
    },
    defaultVariants: {
      state: 'default'
    }
  }
)

function Textarea({ ref, className, rows = 3, error, ...props }) {
  const state = error ? 'error' : 'default'

  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(textareaVariants({ state }), className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }
