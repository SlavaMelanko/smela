import {
  Button,
  Item,
  ItemActions,
  ItemContent,
  ItemTitle
} from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useRemoveTeamMember } from '@ui/hooks/useRemoveTeamMember'

export const RemoveMemberItem = ({ member, teamId }) => {
  const { t } = useLocale()
  const { handleRemoveMember } = useRemoveTeamMember(teamId)

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
          onClick={() => handleRemoveMember(member)}
        >
          {t('team.members.remove.cta')}
        </Button>
      </ItemActions>
    </Item>
  )
}
