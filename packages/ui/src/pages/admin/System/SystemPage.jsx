import { PageContent } from '@ui/components/PageContent'
import { SystemPageHeader } from '@ui/components/PageHeader'
import { Tabs, TabsContent, TabsLine } from '@ui/components/ui'
import { useHashTab } from '@ui/hooks/useHashTab'
import { useLocale } from '@ui/hooks/useLocale'
import { Mail } from 'lucide-react'

import { EmailSenderProfilesTab } from './EmailSenderProfilesTab'

const SystemTab = {
  EMAIL_SENDER_PROFILES: 'email-sender-profiles'
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
      label: () => t('system.emailSenderProfiles')
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
      </Tabs>
    </PageContent>
  )
}
