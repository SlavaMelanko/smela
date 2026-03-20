import { useLocale } from '@/hooks/useLocale'

import { Bandwidth, PricePerUnit, TotalPrice } from '../Pricing'

const getPricePerGB = bandwidth => {
  const price = 4 - ((bandwidth - 1) / 998) * 2

  return parseFloat(price.toFixed(2))
}

const getPricePerGbWithDiscount = (bandwidth, discount) => {
  const price = 4 - ((bandwidth - 1) / 998) * 2
  const priceWithDiscount = price * (1 - discount / 100)

  return parseFloat(priceWithDiscount.toFixed(2))
}

const SummaryItem = ({ label, value }) => (
  <div className='flex items-center justify-between text-muted-foreground'>
    {label} <span>{value}</span>
  </div>
)

const PlanSummary = ({ value, discount }) => {
  const { t, formatNumber, formatPrice } = useLocale()

  const pricePerGB = getPricePerGB(value)
  const totalPrice = (value * pricePerGB).toFixed(2)
  const pricePerGbWithDiscount = getPricePerGbWithDiscount(value, discount)
  const totalPriceWithDiscount = (value * pricePerGbWithDiscount).toFixed(2)

  return (
    <div className='flex w-full flex-col gap-2'>
      <SummaryItem
        label={t('pricing.summary.selected')}
        value={
          <Bandwidth
            value={formatNumber(value)}
            unit={t('unit.traffic.gb')}
            showIcon={false}
          />
        }
      />
      <SummaryItem
        label={t('pricing.summary.price')}
        value={
          <PricePerUnit
            original={formatPrice(pricePerGB)}
            final={formatPrice(pricePerGbWithDiscount)}
            unit={t('unit.traffic.gb')}
          />
        }
      />
      <SummaryItem
        label={t('pricing.summary.total')}
        value={
          <TotalPrice
            original={formatPrice(totalPrice)}
            final={formatPrice(totalPriceWithDiscount)}
          />
        }
      />
    </div>
  )
}

export default PlanSummary
