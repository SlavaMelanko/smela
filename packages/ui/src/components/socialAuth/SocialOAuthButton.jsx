import { LastUsedBadge } from '@ui/components/badges'
import { Button } from '@ui/components/ui'
import { wasLastAuthMethod } from '@ui/lib/storage'

export const SocialOAuthButton = ({
  provider,
  icon,
  label,
  onClick,
  isPending,
  ...props
}) => (
  <Button
    variant='outline'
    className='relative w-full'
    onClick={onClick}
    disabled={isPending}
    data-testid={`${provider}-oauth-button`}
    {...props}
  >
    {icon}
    {label}
    {wasLastAuthMethod(provider) && <LastUsedBadge />}
  </Button>
)
