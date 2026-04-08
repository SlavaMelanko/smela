import { PageContent } from '@ui/components/PageContent'
import { SettingsPageHeader } from '@ui/components/PageHeader'
import { DateTimeSettings } from '@ui/components/settings'
import { Tabs, TabsContent, TabsLine } from '@ui/components/ui'
import { useHashTab } from '@ui/hooks/useHashTab'
import { useLocale } from '@ui/hooks/useLocale'
import { Settings } from 'lucide-react'

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
