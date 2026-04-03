import { Controller } from 'react-hook-form'

import { useLocale } from '@/hooks/useLocale'

import {
  FormError,
  FormFieldWrapper,
  FormInputWrapper,
  FormLabel
} from './Form'

/**
 * Form field wrapper for controlled components using Controller.
 * Use with: Select, DatePicker, Multiselect
 *
 * For native inputs (Input, Textarea, Checkbox), use FormField with register().
 * For inline layout (Switch on same line as label), use FormBoolController.
 *
 * @example
 * <FormController
 *   name="role"
 *   label={t('role.name')}
 *   control={control}
 *   error={errors.role}
 *   render={({ field }) => (
 *     <Select {...field} options={roleOptions} />
 *   )}
 * />
 */
export const FormController = ({
  name,
  label,
  optional,
  control,
  error,
  defaultValue,
  rules,
  render
}) => {
  const { t } = useLocale()

  return (
    <FormFieldWrapper hasError={!!error}>
      {label && (
        <FormLabel htmlFor={name} optional={optional}>
          {label}
        </FormLabel>
      )}
      <FormInputWrapper>
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValue}
          rules={rules}
          render={({ field }) => render({ field, error })}
        />
      </FormInputWrapper>
      {/* Always rendered for smooth enter/exit CSS transitions */}
      <FormError message={error?.message ? t(error.message) : null} />
    </FormFieldWrapper>
  )
}
