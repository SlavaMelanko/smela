import { useLocale } from '@ui/hooks/useLocale'
import { timeSince } from '@ui/lib/format'

const getLastActiveKey = date => {
  const { seconds, minutes, hours, days } = timeSince(date)

  if (seconds < 60) {
    return { key: 'lastActive.justNow' }
  }

  if (minutes < 60) {
    return { key: 'lastActive.minute', count: minutes }
  }

  if (hours < 24) {
    return { key: 'lastActive.hour', count: hours }
  }

  if (days < 30) {
    return { key: 'lastActive.day', count: days }
  }

  return {}
}

export const LastActiveBadge = ({ date, className }) => {
  const { t, formatDate } = useLocale()

  if (!date) {
    return null
  }

  const { key, count } = getLastActiveKey(date)

  const label = key
    ? t(key, count !== undefined ? { count } : undefined)
    : formatDate(date)

  return <span className={className}>{label}</span>
}
