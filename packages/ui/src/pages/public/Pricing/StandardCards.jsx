import {
  CalendarX,
  Mail,
  MessageCircle,
  RefreshCw,
  UserPlus
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { PricingSliderDialog } from '@/components/dialogs'
import { CustomPricingCard, StandardPricingCard } from '@/components/pricing'
import { useLocale } from '@/hooks/useLocale'
import { useModal } from '@/hooks/useModal'

const StandardCards = () => {
  const { t } = useLocale({ keyPrefix: 'pricing' })
  const { openModal } = useModal()
  const navigate = useNavigate()

  const plans = [
    {
      id: 'free',
      title: t('plans.free'),
      bandwidth: {
        value: 1,
        unit: 'GB'
      },
      pricePerUnit: {
        original: 0.0,
        final: 0.0,
        unit: 'GB'
      },
      totalPrice: {
        original: 0.0
      },
      features: [
        {
          icon: <Mail className='size-6 text-blue-500' />,
          text: t('features.emailSupport')
        }
      ],
      redirectPath: '/signup'
    },
    {
      id: 'pro',
      title: t('plans.pro'),
      bandwidth: {
        value: 10,
        unit: 'GB'
      },
      pricePerUnit: {
        original: 7.5,
        final: 3.75,
        unit: 'GB'
      },
      totalPrice: {
        original: 75.0,
        final: 37.5
      },
      features: [
        {
          icon: <Mail className='size-6 text-blue-500' />,
          text: t('features.emailSupport')
        },
        {
          icon: <CalendarX className='size-6 text-orange-500' />,
          text: t('features.cancelAnytime')
        },
        {
          icon: <RefreshCw className='size-6 text-pink-500' />,
          text: t('features.rollover')
        }
      ],
      redirectPath: '/signup',
      discountPercent: 50
    },
    {
      id: 'max',
      title: t('plans.max'),
      bandwidth: {
        value: 100,
        unit: 'GB'
      },
      pricePerUnit: {
        original: 4.99,
        final: 2.49,
        unit: 'GB'
      },
      totalPrice: {
        original: 499.0,
        final: 249.5
      },
      features: [
        {
          icon: <MessageCircle className='size-6 text-blue-500' />,
          text: t('features.premiumSupport')
        },
        {
          icon: <CalendarX className='size-6 text-orange-500' />,
          text: t('features.cancelAnytime')
        },
        {
          icon: <RefreshCw className='size-6 text-pink-500' />,
          text: t('features.rollover')
        },
        {
          icon: <UserPlus className='size-6 text-green-500' />,
          text: t('features.dedicatedManager')
        }
      ],
      redirectPath: '/signup',
      discountPercent: 50
    },
    {
      id: 'custom',
      title: t('plans.custom'),
      customPricing: true,
      totalPrice: {
        original: t('custom.title')
      },
      customMessage: t('custom.note'),
      buttonText: t('custom.cta'),
      showModal: () => {
        const close = openModal({
          children: (
            <PricingSliderDialog
              onComplete={() => {
                close()
                navigate('/signup')
              }}
              onClose={() => close()}
            />
          ),
          size: 'lg'
        })
      }
    }
  ]

  return (
    <div className='grid grid-cols-1 justify-items-center gap-8 md:grid-cols-2 lg:flex lg:justify-center'>
      {plans.map(plan =>
        plan.customPricing ? (
          <CustomPricingCard key={plan.id} {...plan} />
        ) : (
          <StandardPricingCard key={plan.id} {...plan} />
        )
      )}
    </div>
  )
}

export default StandardCards
