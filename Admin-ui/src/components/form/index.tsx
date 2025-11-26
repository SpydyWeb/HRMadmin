import { createFormHook } from '@tanstack/react-form'
import { TextFeild } from './text-field'
import Button from '../ui/button'
import { fieldContext, formContext } from './form-context'

export * from './form-context'

export const { useAppForm } = createFormHook({
  fieldComponents: { TextFeild },
  formComponents: { Button },
  fieldContext,
  formContext,
})
