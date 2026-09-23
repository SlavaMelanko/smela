import { Button, Spinner } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'

export const SubmitButton = ({ className, isLoading, disabled, children }) => {
  const { t } = useLocale()

  return (
    <Button
      type='submit'
      className={className}
      disabled={isLoading || disabled}
    >
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
