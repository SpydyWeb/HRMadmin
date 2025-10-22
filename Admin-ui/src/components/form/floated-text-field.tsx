import { useEffect, useState } from 'react'
import { FieldError } from './field-error'
import { useFieldContext } from '.'
import { Input } from '@/components/ui/input'

interface TextFieldProps {
  label: string
  name?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  type?: string
}

export const FloatedTextFeild = ({
  label,
  name,
  value,
  onChange,
  placeholder = ' ',
  type = 'text',
  readOnly = false,
}: TextFieldProps & { readOnly?: boolean }) => {
  let field
  try {
    field = useFieldContext<string>()
  } catch {
    field = null
  }

  const [localValue, setLocalValue] = useState(value ?? '')

  useEffect(() => {
    if (value !== undefined) setLocalValue(value)
  }, [value])

  const handleChange = (val: string) => {
    if (field) field.handleChange(val)
    else {
      setLocalValue(val)
      onChange?.(val)
    }
  }

  const currentValue = field ? field.state.value : localValue
  const currentName = field ? field.name : name
  const hasValue = currentValue && currentValue.length > 0

  return (
    <div className="relative w-full">
      {/* Input */}
      <Input
        type={type}
        id={currentName}
        name={currentName}
        value={currentValue}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={field?.handleBlur}
        readOnly={readOnly}
        aria-invalid={field?.state.meta?.errors?.length > 0 ? 'true' : 'false'}
        className={`peer block rounded-md border border-gray-300 bg-transparent px-3 pt-7 pb-4 mr-8 text-sm text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''
          }`} />

      {/* Floating Label */}
      <label
        htmlFor={currentName}
        className={`absolute left-3 text-gray-500 transition-all duration-200
        ${hasValue
            ? 'top-0.5 text-sm text-blue-600 font-medium' // ⬅️ bigger blue label
            : 'top-2.5 text-gray-400 text-base'
          }
        peer-focus:top-0.5 peer-focus:text-sm peer-focus:text-blue-600 peer-focus:font-medium pb-4`}
      >
        {label}
      </label>

      {field && <FieldError field={field.state.meta} />}
    </div>
  )
}
