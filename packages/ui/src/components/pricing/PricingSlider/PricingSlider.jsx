import { Slider } from '@ui/components/inputs'
import { Badge, Button } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useState } from 'react'

import FeatureList from './FeatureList'
import PlanSummary from './PlanSummary'

export const PricingSlider = ({ discount, onComplete }) => {
  const { t } = useLocale()
  const [bandwidth, setBandwidth] = useState(1)

  return (
    <div className='flex flex-col items-center gap-4'>
      {discount && (
        <Badge variant='discount'>
          {t('pricing.discount.label', { percent: discount })}
        </Badge>
      )}

      <Slider
        value={bandwidth}
        onChange={setBandwidth}
        min={1}
        max={1000}
        presetValues={[25, 50, 100, 250, 500]}
        unit={t('unit.traffic.gb')}
      />

      <div className='flex w-full flex-col items-center gap-2'>
        <FeatureList value={bandwidth} />
        <PlanSummary value={bandwidth} discount={discount} />
      </div>

      <Button className='w-full' onClick={onComplete}>
        {t('pricing.cta')}
      </Button>
    </div>
  )
}
