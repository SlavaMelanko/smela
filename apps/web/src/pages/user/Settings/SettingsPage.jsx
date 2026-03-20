import { Settings } from 'lucide-react'

import { PageContent } from '@/components/PageContent'
import { SettingsPageHeader } from '@/components/PageHeader'
import { DateTimeSettings } from '@/components/settings'
import { Tabs, TabsContent, TabsLine } from '@/components/ui'
import { useHashTab } from '@/hooks/useHashTab'
import { useLocale } from '@/hooks/useLocale'

const SettingsTab = {
  GENERAL: 'general'
}

export const SettingsPage = () => {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useHashTab(
    Object.values(SettingsTab),
    SettingsTab.GENERAL
  )

  const tabs = [
    {
      value: SettingsTab.GENERAL,
      icon: Settings,
      label: () => t('general')
    }
  ]

  return (
    <PageContent>
      <SettingsPageHeader
        title={t('settings.title')}
        description={t('settings.description')}
      />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsLine tabs={tabs} />
        <TabsContent value={SettingsTab.GENERAL}>
          <DateTimeSettings />
        </TabsContent>
      </Tabs>
    </PageContent>
  )
}
