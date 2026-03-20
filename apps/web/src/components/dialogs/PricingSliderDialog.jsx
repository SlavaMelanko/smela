import { PricingSlider } from '@/components/pricing'
import { DialogBody, DialogHeader, DialogTitle } from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'

export const PricingSliderDialog = ({ onComplete, onClose }) => {
  const { t } = useLocale()

  return (
    <>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{t('pricing.custom.title')}</DialogTitle>
      </DialogHeader>
      <DialogBody scrollable={false}>
        <PricingSlider onComplete={onComplete} />
      </DialogBody>
    </>
  )
}
