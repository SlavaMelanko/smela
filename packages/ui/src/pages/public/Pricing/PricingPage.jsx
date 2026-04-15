import { PageContent } from '@ui/components/PageContent'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/components/ui'
import { useHashTab } from '@ui/hooks/useHashTab'
import { useLocale } from '@ui/hooks/useLocale'

import { EnterpriseTab } from './EnterpriseTab'
import { PricingFaq } from './PricingFaq'
import { StandardCards } from './StandardCards'

const TabId = Object.freeze({
  STANDARD: 'standard',
  ENTERPRISE: 'enterprise'
})

const TabContent = props => (
  <TabsContent
    className='flex min-h-115 items-center justify-center rounded-lg bg-background px-4'
    {...props}
  />
)

export const PricingPage = () => {
  const { t } = useLocale({ keyPrefix: 'pricing' })
  const [activeTab, setActiveTab] = useHashTab(
    Object.values(TabId),
    TabId.STANDARD
  )

  return (
    <PageContent>
      <div className='flex flex-col items-center gap-4 text-center md:gap-5 lg:gap-6'>
        <h1 className='text-4xl font-bold text-foreground'>{t('title')}</h1>
        <p className='text-lg text-muted-foreground'>{t('subtitle')}</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='items-center gap-8'
      >
        <TabsList>
          <TabsTrigger value={TabId.STANDARD}>{t('type.standard')}</TabsTrigger>
          <TabsTrigger value={TabId.ENTERPRISE}>
            {t('type.enterprise')}
          </TabsTrigger>
        </TabsList>
        <TabContent value={TabId.STANDARD}>
          <StandardCards />
        </TabContent>
        <TabContent value={TabId.ENTERPRISE}>
          <EnterpriseTab />
        </TabContent>
      </Tabs>

      <PricingFaq />
    </PageContent>
  )
}
