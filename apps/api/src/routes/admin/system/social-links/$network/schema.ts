import { z } from 'zod'

import { rules } from '@/routes/rules'

export const socialLinkParamsSchema = z.object({
  network: rules.socialLink.network
})
