import { cloneElement } from 'react'

import { useLocale } from '@/hooks/useLocale'

import {
  FormError,
  FormFieldWrapper,
  FormInputWrapper,
  FormLabel
} from './Form'

/**
 * Form field wrapper for native inputs using register().
 * Use with: Input, Textarea, Checkbox
 *
 * For controlled components (Select, Switch, DatePicker), use FormController.
 *
 * @example
 * <FormField name="email" label={t('email.label')} error={errors.email}>
 *   <TextInput placeholder={t('email.placeholder')} {...register('email')} />
 * </FormField>
 */
export const FormField = ({ name, label, optional, children, error }) => {
  const { t } = useLocale()

  const wrappedChild = cloneElement(children, { id: name, name, error })

  return (
    <FormFieldWrapper hasError={!!error}>
      {label && (
        <FormLabel htmlFor={name} optional={optional}>
          {label}
        </FormLabel>
      )}
      <FormInputWrapper>{wrappedChild}</FormInputWrapper>
      {/* Always rendered for smooth enter/exit CSS transitions */}
      <FormError message={error?.message ? t(error.message) : null} />
    </FormFieldWrapper>
  )
}
