import { createResolver, rules } from '@ui/lib/validation'

export const FieldName = {
  POSITION: 'position'
}

export const getDefaultValues = () => ({
  [FieldName.POSITION]: ''
})

export const getValues = ({ position }) => ({
  [FieldName.POSITION]: position ?? ''
})

export const resolver = createResolver({
  [FieldName.POSITION]: rules.position
})
