import { useLocale } from '@ui/hooks/useLocale'
import { datePreset } from '@ui/lib/format/date'
import { Calendar } from 'lucide-react'

import {
  AppearanceLabel,
  AppearanceOption,
  AppearanceOptions,
  AppearanceSection
} from '../Appearance'

export const DateFormat = ({ value, onChange }) => {
  const { t, formatDate } = useLocale()

  return (
    <AppearanceSection>
      <AppearanceLabel icon={Calendar}>{t('format.date.name')}</AppearanceLabel>
      <AppearanceOptions>
        {Object.entries(datePreset).map(([key, options]) => (
          <AppearanceOption
            key={key}
            selected={value === key}
            onClick={() => onChange(key)}
            label={t(`format.date.values.${key}`)}
            description={formatDate(new Date(), options)}
          />
        ))}
      </AppearanceOptions>
    </AppearanceSection>
  )
}
