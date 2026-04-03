import { useNavigate } from 'react-router-dom'

import { Badge, Button } from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'

import { Bandwidth, Feature, PricePerUnit, TotalPrice } from './Pricing'

const translateUnit = (unit, t) => {
  return t(`unit.traffic.${unit.toLowerCase()}`)
}

export const StandardPricingCard = ({
  title,
  bandwidth,
  pricePerUnit,
  totalPrice,
  features,
  redirectPath,
  discountPercent
}) => {
  const { t, formatPrice } = useLocale()
  const navigate = useNavigate()

  return (
    <div className='relative flex min-h-[460px] w-full flex-col rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:border-primary hover:shadow-lg sm:h-[460px]'>
      {discountPercent > 0 && (
        <Badge variant='discount' className='absolute -top-4 -right-3'>
          {t('pricing.discount.label', { percent: discountPercent })}
        </Badge>
      )}

      <h2 className='mb-8 text-3xl font-bold text-foreground'>{title}</h2>

      <Bandwidth
        className='mb-8'
        value={bandwidth.value}
        unit={translateUnit(bandwidth.unit, t)}
      />
      <PricePerUnit
        className='mb-8'
        original={formatPrice(pricePerUnit.original)}
        final={formatPrice(pricePerUnit.final)}
        unit={translateUnit(pricePerUnit.unit, t)}
      />
      <TotalPrice
        original={formatPrice(totalPrice.original)}
        final={formatPrice(totalPrice.final)}
      />

      <ul className='m-0 flex flex-1 list-none flex-wrap items-center justify-center gap-6 p-0'>
        {features.map((feature, index) => (
          <li key={index} className='flex items-center'>
            <Feature icon={feature.icon} text={feature.text} />
          </li>
        ))}
      </ul>

      <Button
        className='mt-auto w-full uppercase'
        onClick={() => navigate(redirectPath)}
      >
        {t('pricing.cta')}
      </Button>
    </div>
  )
}
