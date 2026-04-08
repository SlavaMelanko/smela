import { Link } from '@ui/components/links'
import { useLocale } from '@ui/hooks/useLocale'

import { Prompt } from './Prompt'

export const TermsAndPrivacyPrompt = ({ size = 'sm' }) => {
  const { t } = useLocale()

  return (
    <Prompt size={size}>
      <span>{t('termsAndPrivacy.prefix')}</span>
      <Link size={size} to='/terms' openInNewTab>
        {t('termsAndPrivacy.terms')}
      </Link>
      <span>{t('termsAndPrivacy.and')}</span>
      <Link size={size} to='/privacy' openInNewTab>
        {t('termsAndPrivacy.privacy')}
      </Link>
      <span>.</span>
    </Prompt>
  )
}
