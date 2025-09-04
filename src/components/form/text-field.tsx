import { useEffect, useState } from 'react'
import { FieldError } from './field-error'
import { useFieldContext } from '.'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TextFieldProps {
  label: string
  name?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
}

 export  const  TextFeild = ({
  label,
  name,
  value,
  onChange,
  placeholder,
}: TextFieldProps) => {
  let field
  try {
    // Try to get field context (for AppForm usage)
    field = useFieldContext<string>()
  } catch {
    field = null
  }

  const [localValue, setLocalValue] = useState(value ?? '')

  useEffect(() => {
    if (value !== undefined) setLocalValue(value)
  }, [value])

  const handleChange = (val: string) => {
    if (field) {
      field.handleChange(val)
    } else {
      setLocalValue(val)
      onChange?.(val)
    }
  }

  const currentValue = field ? field.state.value : localValue
  const currentName = field ? field.name : name

  return (
    <div className="space-y-1">
      <Label
        htmlFor={currentName}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </Label>
      <Input
        id={currentName}
        name={currentName}
        value={currentValue}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={field?.handleBlur}
        aria-invalid={field?.state.meta?.errors?.length>0 ? "true" : "false"}
      />
      {field && <FieldError field={field.state.meta} />}
    </div>
  )
}
