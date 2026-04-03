export const datePreset = {
  short: {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  },
  full: {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  },
  numeric: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }
}

export const parseDate = date =>
  typeof date === 'string' || typeof date === 'number' ? new Date(date) : date

export const timeSince = date => {
  const parsed = parseDate(date)

  const seconds = Math.floor((Date.now() - parsed.getTime()) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  return { seconds, minutes, hours, days }
}

export const formatDate = (
  date,
  locale = 'en',
  options = datePreset.numeric
) => {
  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, options).format(parseDate(date))
}

export const formatTime = (date, locale = 'en', hour12 = false) => {
  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12
  }).format(parseDate(date))
}
