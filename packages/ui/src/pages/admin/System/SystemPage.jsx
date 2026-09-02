import { PageContent } from '@ui/components/PageContent'
import { SystemPageHeader } from '@ui/components/PageHeader'
import { Tabs, TabsContent, TabsLine } from '@ui/components/ui'
import { useHashTab } from '@ui/hooks/useHashTab'
import { useLocale } from '@ui/hooks/useLocale'
import { Link, Mail } from 'lucide-react'

import { EmailSenderProfilesTab } from './EmailSenderProfilesTab'
import { SocialLinksTab } from './SocialLinksTab'

const SystemTab = {
  EMAIL_SENDER_PROFILES: 'email-sender-profiles',
  SOCIAL_LINKS: 'social-links'
}

export const SystemPage = () => {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useHashTab(
    Object.values(SystemTab),
    SystemTab.EMAIL_SENDER_PROFILES
  )

  const tabs = [
    {
      value: SystemTab.EMAIL_SENDER_PROFILES,
      icon: Mail,
      label: () => t('emailSenderProfile.label')
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
        <TabsContent value={SystemTab.EMAIL_SENDER_PROFILES}>
          <EmailSenderProfilesTab />
        </TabsContent>
        <TabsContent value={SystemTab.SOCIAL_LINKS}>
          <SocialLinksTab />
        </TabsContent>
      </Tabs>
    </PageContent>
  )
}
