import { useLocale } from '@ui/hooks/useLocale'
import { useLocation, useNavigate } from '@ui/hooks/useRouter'
import {
  useAcceptTeamInvite,
  useDeclineTeamInvite,
  useSwitchTeam
} from '@ui/hooks/useTeam'
import { useToast } from '@ui/hooks/useToast'

const MEMBER_PAGE_PREFIX = '/team/members/'

export const useUserTeams = () => {
  const { te } = useLocale()
  const { showErrorToast } = useToast()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { mutate: switchMutate } = useSwitchTeam()
  const { mutate: acceptMutate } = useAcceptTeamInvite()
  const { mutate: declineMutate } = useDeclineTeamInvite()

  const onError = error => showErrorToast(te(error))

  const onActiveTeamChange = () => {
    // The open member may not belong to the new team
    if (pathname.startsWith(MEMBER_PAGE_PREFIX)) {
      navigate('/team/members')
    }
  }

  const switchTeam = teamId =>
    switchMutate(teamId, { onSuccess: onActiveTeamChange, onError })

  const acceptInvite = teamId =>
    acceptMutate(teamId, { onSuccess: onActiveTeamChange, onError })

  const declineInvite = teamId => declineMutate(teamId, { onError })

  return { switchTeam, acceptInvite, declineInvite }
}
