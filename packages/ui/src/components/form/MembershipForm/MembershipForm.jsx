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
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { FieldName, getDefaultValues, getValues, resolver } from './schema'

// The API hides admins' nicknames and gives an id only to active teammates
const Teammate = ({ teammate, getMemberLink }) => {
  const { t } = useLocale()
  const name = teammate.nickname ?? t('systemAdmin')

  return teammate.id ? (
    <Link to={getMemberLink(teammate.id)}>{name}</Link>
  ) : (
    name
  )
}

export const MembershipForm = ({
  member,
  team,
  teamLink,
  creator,
  getMemberLink,
  isSubmitting,
  onSubmit,
  canManageTeams = false
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
        <FormRow forceColumns>
          <FormField label={t('team.name.label2')} optional>
            <FormReadOnly>
              <Link to={teamLink}>{team.name}</Link>
            </FormReadOnly>
          </FormField>

          {creator && (
            <FormField label={t('createdBy')} optional>
              <FormReadOnly>
                <Teammate teammate={creator} getMemberLink={getMemberLink} />
              </FormReadOnly>
            </FormField>
          )}
        </FormRow>

        <FormRow>
          <FormField
            label={t('position.label')}
            name={FieldName.POSITION}
            error={errors[FieldName.POSITION]}
            optional
          >
            <Input
              {...register(FieldName.POSITION)}
              readOnly={!canManageTeams}
            />
          </FormField>
        </FormRow>

        <FormRow forceColumns>
          {member?.inviter && (
            <FormField label={t('invitedBy')} optional>
              <FormReadOnly>
                <Teammate
                  teammate={member.inviter}
                  getMemberLink={getMemberLink}
                />
              </FormReadOnly>
            </FormField>
          )}

          <FormField label={t('joinedAt')} optional>
            <FormReadOnly>{formatDate(member?.joinedAt)}</FormReadOnly>
          </FormField>
        </FormRow>

        {canManageTeams && (
          <FormActions isDirty={isDirty}>
            <SubmitButton isLoading={isSubmitting}>{t('save')}</SubmitButton>
          </FormActions>
        )}
      </FormFields>
    </FormRoot>
  )
}
