import {
  Button,
  Item,
  ItemActions,
  ItemContent,
  ItemTitle
} from '@ui/components/ui'
import { useDeleteTeamMember } from '@ui/hooks/useDeleteTeamMember'
import { useLocale } from '@ui/hooks/useLocale'

export const RemoveMemberItem = ({ member, teamId }) => {
  const { t } = useLocale()
  const { handleDeleteMember } = useDeleteTeamMember(teamId)

  return (
    <Item variant='outline' className='border-destructive/20'>
      <ItemContent>
        <ItemTitle className='text-base leading-normal font-normal'>
          {t('team.members.remove.title')}
        </ItemTitle>
      </ItemContent>
      <ItemActions>
        <Button
          variant='destructive'
          onClick={() => handleDeleteMember(member)}
        >
          {t('team.members.remove.cta')}
        </Button>
      </ItemActions>
    </Item>
  )
}
