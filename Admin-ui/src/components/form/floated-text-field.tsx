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
  // const hasValue = currentValue && currentValue.length > 0
  const hasValue =
    currentValue !== undefined &&
    currentValue !== null &&
    String(currentValue).trim() !== ''


  return (
    <div className="relative w-full pt-3">
      {/* Input */}

      <Input
        type={type}
        id={currentName}
        name={currentName}
        value={currentValue}
        placeholder=" "
        onChange={(e) => handleChange(e.target.value)}
        onBlur={field?.handleBlur}
        readOnly={readOnly}
        className={`
    input-text peer w-full border-0 !border-b-[0.5px] rounded-none shadow-none
    px-0 pb-2 pt-6 text-orange-500 bg-transparent
    focus:outline-none focus:ring-0 
    focus:border-orange-500
    ${readOnly ? "cursor-not-allowed text-orange-400" : "border-gray-300"}
  `}
      />

      {/* Floating Label */}

      <label
        htmlFor={currentName}
        // className={`
        //   absolute left-0 text-black-500 transition-all duration-200 pointer-events-none
        //   ${hasValue
        //     ? "top-0 text-xs text-black-600"
        //     : "top-4 text-sm"
        //   }
        //   peer-focus:top-0 peer-focus:text-xs peer-focus:text-orange-600
        // `}
        className={`
    label-text absolute left-0 transition-all duration-200 pointer-events-none
    ${hasValue
            ? "top-0 text-xs text-gray-600"
            : "top-4 text-sm text-gray-600"
          }
    peer-focus:top-0 peer-focus:text-xs peer-focus:text-gray-600
  `}
      >
        {label}
      </label>
      {field && <FieldError field={field.state.meta} />}
    </div>
  )
}
