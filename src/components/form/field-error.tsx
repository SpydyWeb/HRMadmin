import { FiAlertCircle } from 'react-icons/fi'
import type { AnyFieldMeta } from '@tanstack/react-form'

export function FieldError({ field }: { field: AnyFieldMeta }) {
  return (
    field.isTouched &&
    !field.isValid &&
    field.errors.map((err: any, key: number) => (
      <div
        className="flex items-center text-sm text-red-600 bg-red-50 border border-red-300 rounded-lg p-1"
        key={key}
      >
        <FiAlertCircle className="w-4 h-4 mr-2" />
        <span>{err.message}</span>
      </div>
    ))
  )
}
