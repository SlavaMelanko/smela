import { PageContent } from '@ui/components/PageContent'
import { SystemPageHeader } from '@ui/components/PageHeader'
import { Tabs, TabsContent, TabsLine } from '@ui/components/ui'
import { useHashTab } from '@ui/hooks/useHashTab'
import { useLocale } from '@ui/hooks/useLocale'
import { Link, Mail } from 'lucide-react'

import { EmailTab } from './Email'
import { SocialLinksTab } from './SocialLinks'

const SystemTab = {
  EMAIL: 'email',
  SOCIAL_LINKS: 'social-links'
}

export const SystemPage = () => {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useHashTab(
    Object.values(SystemTab),
    SystemTab.EMAIL
  )

  const tabs = [
    {
      value: SystemTab.EMAIL,
      icon: Mail,
      label: () => t('email.label')
    },
    {
      value: SystemTab.SOCIAL_LINKS,
      icon: Link,
      label: () => t('socialLink.label')
    }
  ]

  return (
    <PageContent>
      <SystemPageHeader
        title={t('system.title')}
        description={t('system.description')}
      />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsLine tabs={tabs} />
        <TabsContent value={SystemTab.EMAIL}>
          <EmailTab />
        </TabsContent>
        <TabsContent value={SystemTab.SOCIAL_LINKS}>
          <SocialLinksTab />
        </TabsContent>
      </Tabs>
    </PageContent>
  )
}
