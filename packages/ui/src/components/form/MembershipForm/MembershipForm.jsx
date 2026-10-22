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

const TeamCreator = ({ creator, link }) => {
  const { t } = useLocale()

  // The API hides the nickname when an admin created the team
  const name = creator.nickname ?? t('systemAdmin')

  return link ? <Link to={link}>{name}</Link> : name
}

export const MembershipForm = ({
  member,
  team,
  teamLink,
  creator,
  creatorLink,
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
                <TeamCreator creator={creator} link={creatorLink} />
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

          <FormField label={t('joinedAt')} optional>
            <FormReadOnly>{formatDate(member?.joinedAt)}</FormReadOnly>
          </FormField>
        </FormRow>

        {member?.inviter && (
          <FormRow forceColumns>
            <FormField label={t('invitedBy')} optional>
              <FormReadOnly>{member.inviter.nickname}</FormReadOnly>
            </FormField>
          </FormRow>
        )}

        {canManageTeams && (
          <FormActions isDirty={isDirty}>
            <SubmitButton isLoading={isSubmitting}>{t('save')}</SubmitButton>
          </FormActions>
        )}
      </FormFields>
    </FormRoot>
  )
}
