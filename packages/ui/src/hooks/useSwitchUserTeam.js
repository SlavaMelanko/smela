import { useLocale } from '@ui/hooks/useLocale'
import { useLocation, useNavigate } from '@ui/hooks/useRouter'
import { useSwitchTeam } from '@ui/hooks/useTeam'
import { useToast } from '@ui/hooks/useToast'

const MEMBER_PAGE_PREFIX = '/team/members/'

export const useSwitchUserTeam = () => {
  const { te } = useLocale()
  const { showErrorToast } = useToast()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { mutate } = useSwitchTeam()

  const switchTeam = teamId =>
    mutate(teamId, {
      onSuccess: () => {
        // The open member may not belong to the new team
        if (pathname.startsWith(MEMBER_PAGE_PREFIX)) {
          navigate('/team/members')
        }
      },
      onError: error => showErrorToast(te(error))
    })

  return { switchTeam }
}
