// React Compiler breaks RHF's proxy-based isDirty subscription
'use no memo'

import {
  FormActions,
  FormField,
  FormFields,
  FormReadOnly,
  FormRoot,
  FormRow,
  SubmitButton
} from '@ui/components/form'
import { Link } from '@ui/components/links'
import { Input } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { getFullName } from '@ui/lib/format'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { FieldName, getDefaultValues, getValues, resolver } from './schema'

export const MembershipForm = ({
  member,
  team,
  teamLink,
  isSubmitting,
  onSubmit
}) => {
  const { t, formatDate } = useLocale()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    resolver,
    defaultValues: getDefaultValues()
  })

  useEffect(() => {
    if (member) {
      reset(getValues(member))
    }
  }, [member, reset])

  return (
    <FormRoot onSubmit={handleSubmit(onSubmit)}>
      <FormFields>
        <FormRow>
          <FormField label={t('team.name.label2')} optional>
            <FormReadOnly>
              <Link to={teamLink}>{team.name}</Link>
            </FormReadOnly>
          </FormField>

          <FormField
            label={t('position.label')}
            name={FieldName.POSITION}
            error={errors[FieldName.POSITION]}
            optional
          >
            <Input {...register(FieldName.POSITION)} />
          </FormField>
        </FormRow>

        <FormRow forceColumns>
          <FormField label={t('joinedAt')} optional>
            <FormReadOnly>{formatDate(member?.joinedAt)}</FormReadOnly>
          </FormField>

          {member?.inviter && (
            <FormField label={t('invitedBy')} optional>
              <FormReadOnly>{getFullName(member?.inviter)}</FormReadOnly>
            </FormField>
          )}
        </FormRow>

        <FormActions isDirty={isDirty}>
          <SubmitButton isLoading={isSubmitting}>{t('save')}</SubmitButton>
        </FormActions>
      </FormFields>
    </FormRoot>
  )
}
