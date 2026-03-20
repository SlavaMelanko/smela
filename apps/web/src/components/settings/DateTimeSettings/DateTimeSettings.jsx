import { useLocale } from '@/hooks/useLocale'

import { DateFormat } from './DateFormat'
import { TimeFormat } from './TimeFormat'

export const DateTimeSettings = () => {
  const { formatPreferences, changeFormatPreference } = useLocale()

  return (
    <div className='flex flex-col gap-6 lg:gap-8'>
      <DateFormat
        value={formatPreferences.date}
        onChange={value => changeFormatPreference('date', value)}
      />
      <TimeFormat
        value={formatPreferences.time}
        onChange={value => changeFormatPreference('time', value)}
      />
    </div>
  )
}
