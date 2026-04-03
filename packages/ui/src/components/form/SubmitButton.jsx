import { Button, Spinner } from '@/components/ui'
import { useLocale } from '@/hooks/useLocale'

export const SubmitButton = ({ isLoading, disabled, children }) => {
  const { t } = useLocale()

  return (
    <Button type='submit' disabled={isLoading || disabled}>
      {isLoading ? (
        <>
          <Spinner size={16} />
          {t('processing')}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
