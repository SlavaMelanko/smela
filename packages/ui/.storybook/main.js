const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx)'],
  addons: ['@storybook/addon-onboarding'],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  async viteFinal(config) {
    const { mergeConfig } = await import('vite')
    const tailwindcss = (await import('@tailwindcss/vite')).default

    return mergeConfig(config, {
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          '#': new URL('../src', import.meta.url).pathname
        }
      }
    })
  }
}

export default config
