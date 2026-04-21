import {
  ForgotYourPasswordPrompt,
  LoginPrompt,
  SignupPrompt,
  TermsAndPrivacyPrompt
} from '.'

export default {
  title: 'Components/Prompts',
  parameters: { layout: 'fullscreen' },
  decorators: [
    Story => (
      <div className='flex items-center justify-center w-full min-h-screen'>
        <Story />
      </div>
    )
  ],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg']
    }
  },
  args: { size: 'sm' }
}

export const AllPrompts = {
  render: ({ size }) => (
    <div className='flex flex-col gap-4'>
      <ForgotYourPasswordPrompt size={size} />
      <LoginPrompt size={size} />
      <SignupPrompt size={size} />
      <TermsAndPrivacyPrompt size={size} />
    </div>
  )
}
