import { Globe } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { cn } from '@/lib/utils'

export const Bandwidth = ({ value, unit, className = '', showIcon = true }) => (
  <div className={cn('flex items-center justify-center gap-2', className)}>
    {showIcon && <Globe className='size-6' />}
    <p className='text-2xl font-medium text-foreground'>
      {value} {unit}
    </p>
  </div>
)

export const Feature = ({ icon, text }) => (
  <Tooltip>
    <TooltipTrigger className='flex cursor-help items-center justify-center rounded-full border-none bg-transparent p-1 transition-colors hover:bg-border'>
      {icon}
    </TooltipTrigger>
    <TooltipContent>{text}</TooltipContent>
  </Tooltip>
)

const formatPrice = (price, unit) => `${price} / ${unit}`

export const PricePerUnit = ({ original, final, unit, className = '' }) => {
  const hasDiscount = !!final && final < original

  return (
    <p className={cn('text-center text-base text-muted-foreground', className)}>
      {hasDiscount ? (
        <>
          <span className='mr-2 text-muted-foreground line-through'>
            {original}
          </span>
          {formatPrice(final, unit)}
        </>
      ) : (
        formatPrice(original, unit)
      )}
    </p>
  )
}

export const TotalPrice = ({ original, final, className = '' }) => {
  const hasDiscount = !!final && final < original

  return (
    <div className={cn('flex items-baseline justify-center', className)}>
      {hasDiscount ? (
        <>
          <span className='mr-2 text-base text-muted-foreground line-through'>
            {original}
          </span>
          <span className='text-2xl font-bold text-foreground'>{final}</span>
        </>
      ) : (
        <span className='text-2xl font-bold text-foreground'>{original}</span>
      )}
    </div>
  )
}
