import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import Button from '../ui/button'
import { TextFeild } from './text-field'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm } = createFormHook({
  fieldComponents: {TextFeild},
  formComponents: {Button},
  fieldContext,
  formContext,
})
