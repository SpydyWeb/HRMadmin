import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { TextFeild } from './text-field'
import { SubmitButton } from './submit-button'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm } = createFormHook({
  fieldComponents: {TextFeild},
  formComponents: {SubmitButton},
  fieldContext,
  formContext,
})
