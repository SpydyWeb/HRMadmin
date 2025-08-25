import { FieldError } from './field-error';
import { useFieldContext } from '.'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TextFieldProps {
  label: string;
}

export const TextFeild = ({ label }: TextFieldProps) => {
  const field = useFieldContext<string>()
  return (
    <div className="space-y-1">
      <Label
        htmlFor={field.name}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </Label>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <FieldError field={field.state.meta} />
    </div>
  )
}
