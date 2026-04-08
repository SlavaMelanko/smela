import { FormRoot, SubmitButton } from '@ui/components/form'
import { useLocale } from '@ui/hooks/useLocale'
import { useForm } from 'react-hook-form'

import { getDefaultValues, resolver } from './schema'

export const EmailConfirmationForm = ({ isLoading, email, onSubmit }) => {
  const { t } = useLocale()

  const {
    handleSubmit,
    formState: { isSubmitting }
  } = useForm({
    resolver,
    defaultValues: getDefaultValues(email)
  })

  return (
    <FormRoot onSubmit={handleSubmit(data => onSubmit(data))}>
      <SubmitButton isLoading={isSubmitting || isLoading}>
        {t('email.confirmation.cta')}
      </SubmitButton>
    </FormRoot>
  )
}
