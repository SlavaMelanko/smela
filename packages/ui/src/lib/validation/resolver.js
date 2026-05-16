import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export const createResolver = (schema, refine) => {
  const base = z.object(schema)

  return zodResolver(refine ? base.superRefine(refine) : base)
}
