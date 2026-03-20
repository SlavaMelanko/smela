import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'

const EnterpriseTab = () => {
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

export default EnterpriseTab
