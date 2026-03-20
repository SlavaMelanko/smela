import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

export const CustomPricingCard = ({
  title,
  totalPrice,
  customMessage,
  buttonText,
  showModal,
  className
}) => {
  return (
    <div
      className={cn(
        'relative flex min-h-[460px] w-full flex-col rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:border-primary hover:shadow-lg sm:h-[460px]',
        className
      )}
    >
      <h2 className='mb-8 text-3xl font-bold text-foreground'>{title}</h2>

      {/* Stub for Bandwidth */}
      <div className='mb-8 h-7' />
      {/* Stub for PricePerUnit */}
      <div className='mb-8 h-6' />
      {/* TotalPrice equivalent */}
      <p className='text-center text-2xl font-bold text-foreground'>
        {totalPrice.original}
      </p>

      <div className='flex flex-1 items-center justify-center'>
        <p className='text-center text-muted-foreground'>{customMessage}</p>
      </div>

      <Button
        className='mt-auto w-full uppercase'
        variant='outline'
        onClick={() => showModal()}
      >
        {buttonText}
      </Button>
    </div>
  )
}
