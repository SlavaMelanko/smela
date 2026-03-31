import i18n from 'i18next'

export const createI18n = async ({
  lng,
  fallbackLng = 'en',
  resources,
  backend,
  plugins = [],
} = {}) => {
  const instance = i18n.createInstance()

  for (const plugin of plugins) {
    instance.use(plugin)
  }

  await instance.init({
    lng,
    fallbackLng,
    resources,
    backend,
    interpolation: {
      escapeValue: false,
    },
  })

  return instance
}
