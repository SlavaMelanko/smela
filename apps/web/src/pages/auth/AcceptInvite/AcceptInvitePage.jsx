import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Spinner } from '@/components/Spinner'
import { useAcceptInvite, useCheckInvite } from '@/hooks/useAuth'
import { useLocale } from '@/hooks/useLocale'
import { useToast } from '@/hooks/useToast'
import { useUrlParams } from '@/hooks/useUrlParams'
import env from '@/lib/env'

import { AuthDescription, AuthHeader, AuthRoot, AuthTitle } from '../Auth'
import { AcceptInviteForm } from './PasswordForm'

const formatTeamName = name =>
  name.length > 10 ? <span className='block'>{name}</span> : ` ${name}`

export const AcceptInvitePage = () => {
  const { t, te } = useLocale()
  const { showSuccessToast, showErrorToast } = useToast()
  const navigate = useNavigate()
  const { token } = useUrlParams(['token'])
  const { mutate: acceptInvite, isPending } = useAcceptInvite()
  const { data, isPending: isChecking, isError, error } = useCheckInvite(token)

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true })
    }
  }, [token, navigate])

  useEffect(() => {
    if (isError) {
      showErrorToast(te(error))
      navigate('/', { replace: true })
    }
  }, [isError, error, te, showErrorToast, navigate])

  const handleAcceptInvite = data => {
    acceptInvite(
      { token, password: data.newPassword },
      {
        onSuccess: () => {
          showSuccessToast(t('invite.accept.success'))
          navigate('/')
        },
        onError: err => {
          showErrorToast(te(err))
        }
      }
    )
  }

  if (!token || isError) {
    return null
  }

  if (isChecking && !data) {
    return <Spinner text={t('invite.accept.validating')} />
  }

  return (
    <AuthRoot>
      <AuthHeader>
        <AuthTitle>
          {t('invite.accept.title')}
          {formatTeamName(data.teamName || env.APP_NAME)}
        </AuthTitle>
        <AuthDescription>{t('invite.accept.description')}</AuthDescription>
      </AuthHeader>

      <AcceptInviteForm isLoading={isPending} onSubmit={handleAcceptInvite} />
    </AuthRoot>
  )
}
