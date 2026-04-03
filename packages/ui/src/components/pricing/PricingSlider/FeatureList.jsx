import {
  CalendarX,
  Mail,
  MessageCircle,
  RefreshCw,
  UserPlus
} from 'lucide-react'

import { useLocale } from '@/hooks/useLocale'

import { Feature } from '../Pricing'

const featureMap = {
  emailSupport: {
    icon: <Mail className='size-6 text-blue-500' />,
    text: 'pricing.features.emailSupport'
  },
  cancelAnytime: {
    icon: <CalendarX className='size-6 text-orange-500' />,
    text: 'pricing.features.cancelAnytime'
  },
  rollover: {
    icon: <RefreshCw className='size-6 text-pink-500' />,
    text: 'pricing.features.rollover'
  },
  premiumSupport: {
    icon: <MessageCircle className='size-6 text-blue-500' />,
    text: 'pricing.features.premiumSupport'
  },
  dedicatedManager: {
    icon: <UserPlus className='size-6 text-green-500' />,
    text: 'pricing.features.dedicatedManager'
  }
}

const getFeatures = value => {
  if (value < 100) {
    return [
      featureMap.emailSupport,
      featureMap.cancelAnytime,
      featureMap.rollover
    ]
  }

  if (value < 500) {
    return [
      featureMap.premiumSupport,
      featureMap.cancelAnytime,
      featureMap.rollover
    ]
  }

  return [
    featureMap.premiumSupport,
    featureMap.cancelAnytime,
    featureMap.rollover,
    featureMap.dedicatedManager
  ]
}

const FeatureList = ({ value }) => {
  const { t } = useLocale()

  const features = getFeatures(value)

  return (
    <div className='flex w-full flex-wrap items-center justify-between gap-4'>
      <div className='mr-auto whitespace-nowrap text-muted-foreground'>
        {t('pricing.summary.includedFeatures')}
      </div>
      <ul className='m-0 flex list-none flex-wrap justify-end gap-4 p-0'>
        {features.map(({ icon, text }) => (
          <li key={text} className='flex items-center'>
            <Feature icon={icon} text={t(text)} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FeatureList
