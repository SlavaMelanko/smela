import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'

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
