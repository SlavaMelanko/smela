import { TextSeparator } from '@ui/components/Separator'
import { useLocale } from '@ui/hooks/useLocale'

import { EmailSenderProfiles } from './EmailSenderProfiles'

export const EmailTab = () => {
  const { t } = useLocale()

  return (
    <div className='flex flex-col gap-6'>
      <TextSeparator text={t('emailSenderProfile.label')} align='left' />
      <EmailSenderProfiles />
    </div>
  )
}
