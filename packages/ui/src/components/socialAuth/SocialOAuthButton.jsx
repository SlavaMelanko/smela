import { LastUsedBadge } from '@ui/components/badges'
import { Button } from '@ui/components/ui'
import { wasLastAuthMethod } from '@ui/lib/storage'

export const SocialOAuthButton = ({
  provider,
  icon,
  label,
  onClick,
  isPending
}) => (
  <Button
    variant='outline'
    className='relative w-full'
    onClick={onClick}
    disabled={isPending}
  >
    {icon}
    {label}
    {wasLastAuthMethod(provider) && <LastUsedBadge />}
  </Button>
)
