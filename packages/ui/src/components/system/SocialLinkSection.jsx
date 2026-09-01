import {
  FormField,
  FormFields,
  FormReadOnly,
  FormRow
} from '@ui/components/form'
import { SvgEditor } from '@ui/components/icons'
import { Input } from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'
import { useState } from 'react'

export const SocialLinkSection = ({ socialLink }) => {
  const { t, formatDate } = useLocale()

  const [network, setNetwork] = useState(socialLink.network)
  const [url, setUrl] = useState(socialLink.url)
  const [svg, setSvg] = useState(socialLink.svg)

  return (
    <FormFields>
      <FormRow>
        <FormField label={t('socialLink.network.label')} optional>
          <Input value={network} onChange={e => setNetwork(e.target.value)} />
        </FormField>

        <FormField label={t('socialLink.url.label')} optional>
          <Input value={url} onChange={e => setUrl(e.target.value)} />
        </FormField>
      </FormRow>

      <FormField label={t('socialLink.svg.label')} optional>
        <SvgEditor value={svg} onChange={e => setSvg(e.target.value)} />
      </FormField>

      <FormRow forceColumns>
        <FormField label={t('createdAt')} optional>
          <FormReadOnly>{formatDate(socialLink.createdAt)}</FormReadOnly>
        </FormField>
        <FormField label={t('updatedAt')} optional>
          <FormReadOnly>{formatDate(socialLink.updatedAt)}</FormReadOnly>
        </FormField>
      </FormRow>
    </FormFields>
  )
}
