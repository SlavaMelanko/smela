import { Button } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useNavigate } from '@ui/hooks/useRouter'

export const EnterpriseTab = () => {
  const { t } = useLocale()
  const navigate = useNavigate()

  return (
    <div className='flex h-115 w-84 flex-col items-center justify-center gap-8'>
      <p className='text-center text-base text-muted-foreground'>
        {t('pricing.enterprise.msg')}
      </p>
      <Button
        variant='outline'
        className='w-full uppercase'
        onClick={() => navigate('/signup')}
      >
        {t('pricing.enterprise.cta')}
      </Button>
    </div>
  )
}
