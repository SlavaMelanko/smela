import { UpdatePasswordSection } from '@/components/profile'
import { TextSeparator } from '@/components/Separator'
import { useLocale } from '@/hooks/useLocale'

export const SecurityTab = () => {
  const { t } = useLocale()

  return (
    <div className='flex flex-col gap-6'>
      <TextSeparator text={t('password.label.default')} align='left' />
      <UpdatePasswordSection />
    </div>
  )
}
