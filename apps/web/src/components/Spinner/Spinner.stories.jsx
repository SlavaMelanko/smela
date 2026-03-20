import { Spinner } from '.'

export default {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl']
    },
    text: {
      control: 'text'
    }
  },
  args: {
    size: 'md'
  }
}

export const Default = {
  render: ({ size, text }) => <Spinner size={size} text={text || size} />
}
