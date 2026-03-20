export const formatNumber = (value, locale = 'en', options = {}) => {
  if (value === undefined) {
    return 'NaN'
  }

  if (value === null) {
    return '0'
  }

  return new Intl.NumberFormat(locale, options).format(value)
}
