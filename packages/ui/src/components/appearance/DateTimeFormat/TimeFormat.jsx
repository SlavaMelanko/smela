import { useLocale } from '@ui/hooks/useLocale'
import { Clock } from 'lucide-react'

import {
  AppearanceLabel,
  AppearanceOption,
  AppearanceOptions,
  AppearanceSection
} from '../Appearance'

const timeFormats = [
  { value: '12', hour12: true },
  { value: '24', hour12: false }
]

export const TimeFormat = ({ value, onChange }) => {
  const { t, formatTime } = useLocale()

  return (
    <AppearanceSection>
      <AppearanceLabel icon={Clock}>{t('format.time.name')}</AppearanceLabel>
      <AppearanceOptions>
        {timeFormats.map(option => (
          <AppearanceOption
            key={option.value}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
            label={t(`format.time.values.${option.value}`)}
            description={formatTime(new Date(), option.hour12)}
          />
        ))}
      </AppearanceOptions>
    </AppearanceSection>
  )
}
