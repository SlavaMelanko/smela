import { UpdatePasswordForm } from '@ui/components/form'
import { useUpdatePassword } from '@ui/hooks/useAuth'
import { useLocale } from '@ui/hooks/useLocale'
import { useToast } from '@ui/hooks/useToast'

export const UpdatePasswordSection = () => {
  const { t, te } = useLocale()
  const { showSuccessToast, showErrorToast } = useToast()
  const { mutate: updatePassword, isPending } = useUpdatePassword()

  const submit = (data, reset) => {
    updatePassword(data, {
      onSuccess: () => {
        reset()
        showSuccessToast(t('changesSaved'))
      },
      onError: error => {
        showErrorToast(te(error))
      }
    })
  }

  return <UpdatePasswordForm isSubmitting={isPending} onSubmit={submit} />
}
