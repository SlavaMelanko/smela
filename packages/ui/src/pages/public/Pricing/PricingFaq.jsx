import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@ui/components/ui'
import { useLocale } from '@ui/hooks/useLocale'

export const PricingFaq = () => {
  const { t } = useLocale({ keyPrefix: 'pricing.faq' })
  const items = t('items', { returnObjects: true })

  return (
    <div className='flex flex-col gap-4 md:gap-5 lg:gap-6'>
      <h2 className='text-center text-lg font-semibold text-foreground'>
        {t('title')}
      </h2>

      <Accordion className='mx-auto max-w-2xl'>
        {items.map(item => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
