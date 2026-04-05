import { UpdatePasswordSection } from '@ui/components/profile'
import { TextSeparator } from '@ui/components/Separator'
import { useLocale } from '@ui/hooks/useLocale'

export const SecurityTab = () => {
  const { t } = useLocale()

  return (
    <div className='flex flex-col gap-6'>
      <TextSeparator text={t('password.label.default')} align='left' />
      <UpdatePasswordSection />
    </div>
  )
}
