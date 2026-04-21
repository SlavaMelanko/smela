import { Button } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useNavigate } from '@ui/hooks/useRouter'
import { ChevronLeft } from 'lucide-react'

export const BackButton = ({ to }) => {
  const navigate = useNavigate()
  const { t } = useLocale()

  return (
    <Button variant='ghost' onClick={() => navigate(to ?? -1)}>
      <ChevronLeft className='size-4' />
      {t('back')}
    </Button>
  )
}
