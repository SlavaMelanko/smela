import { PricingSlider } from '@ui/components/pricing'
import { DialogBody, DialogHeader, DialogTitle } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'

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
