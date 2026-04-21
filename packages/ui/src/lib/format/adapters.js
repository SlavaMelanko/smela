export const adapters = {
  uk: {
    price: formatted => formatted.replace(/\s?USD/, '$') // '1,00 USD' -> '1,00$'
  }
}
