import {
  Button,
  Item,
  ItemActions,
  ItemContent,
  ItemTitle
} from '@ui/components/ui'

export const DangerItem = ({ title, cta, onClick, disabled }) => (
  <Item variant='outline'>
    <ItemContent>
      <ItemTitle className='text-base leading-normal font-normal'>
        {title}
      </ItemTitle>
    </ItemContent>
    <ItemActions>
      <Button variant='destructive' disabled={disabled} onClick={onClick}>
        {cta}
      </Button>
    </ItemActions>
  </Item>
)
