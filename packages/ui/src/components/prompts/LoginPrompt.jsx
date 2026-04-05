import { Link } from '@ui/components/links'
import { useLocale } from '@ui/hooks/useLocale'

import { Prompt } from './Prompt'

export const LoginPrompt = ({ question, size = 'sm' }) => {
  const { t } = useLocale()

  return (
    <Prompt size={size}>
      <span>{question || t('alreadyHaveAccount')}</span>
      <Link size={size} to='/login'>
        {t('login.verb')}
      </Link>
    </Prompt>
  )
}
