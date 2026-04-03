import { Calendar } from 'lucide-react'

import { useLocale } from '@/hooks/useLocale'
import { datePreset } from '@/lib/format/date'

import {
  SettingsLabel,
  SettingsOption,
  SettingsOptions,
  SettingsSection
} from '../Settings'

export const DateFormat = ({ value, onChange }) => {
  const { t, formatDate } = useLocale()

  return (
    <SettingsSection>
      <SettingsLabel icon={Calendar}>{t('format.date.name')}</SettingsLabel>
      <SettingsOptions>
        {Object.entries(datePreset).map(([key, options]) => (
          <SettingsOption
            key={key}
            selected={value === key}
            onClick={() => onChange(key)}
            label={t(`format.date.values.${key}`)}
            description={formatDate(new Date(), options)}
          />
        ))}
      </SettingsOptions>
    </SettingsSection>
  )
}
