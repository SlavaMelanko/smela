import { useForm } from 'react-hook-form'

import { FormRoot, SubmitButton } from '@/components/form'
import { useLocale } from '@/hooks/useLocale'

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
