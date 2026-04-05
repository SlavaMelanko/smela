import { Button } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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
