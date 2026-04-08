import { adapters } from './adapters'

export const formatPrice = (
  value,
  locale = 'en',
  currency = 'USD',
  options = {}
) => {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...options
  })

  let formatted = formatter.format(value)

  const adapter = adapters[locale]

  if (adapter) {
    formatted = adapter.price(formatted)
  }

  return formatted
}
