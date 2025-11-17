import React from 'react'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { FieldError } from './field-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Button from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'


interface DynamicFormBuilderProps {
  config: any
  onSubmit: (data: Record<string, any>) => void
  onFieldClick?: (fieldName: string,data?:Array<any>) => void
}
const DynamicFormBuilder: React.FC<DynamicFormBuilderProps> = ({
  config,
  onSubmit,
  onFieldClick = () => {},
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm({
    defaultValues: config.fields.reduce((acc, field) => {
      acc[field.name] =
        field.type === 'checkbox' ? false : field.type === 'number' ? 0 : ''
      return acc
    }, {}),
    onSubmit: async ({ value }) => {
      if (onSubmit) {
        setIsSubmitting(true)
        try {
          await onSubmit(value)
        } finally {
          setIsSubmitting(false)
        }
      }
    },
    validatorAdapter: zodValidator,
  })

  const renderField = (field) => {
    const fieldSchema = config.schema.shape[field.name]

    return (
      <form.Field
        key={field.name}
        name={field.name}
        validators={{
          onChange: fieldSchema,
        }}
      >
        {(fieldApi) => {
          const handleChange = (value) => {
            if (field.type === 'number') {
              fieldApi.handleChange(value === '' ? 0 : Number(value))
            } else {
              fieldApi.handleChange(value)
            }
          }

          return (
            <div
              className="space-y-2"
              style={{
                gridColumn: `span ${field.colSpan} / span ${field.colSpan}`,
              }}
            >
              {field.type !== 'checkbox'&&field.type !== 'link' && (
                <Label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                </Label>
              )}

              {field.type === 'text' && (
                <Input
                  id={field.name}
                  type="text"
                  placeholder={field.placeholder}
                  value={fieldApi.state.value}
                  onChange={(e) => handleChange(e.target.value)}
                  className="w-full"
                />
              )}

              {field.type === 'email' && (
                <Input
                  id={field.name}
                  type="email"
                  placeholder={field.placeholder}
                  value={fieldApi.state.value}
                  onChange={(e) => handleChange(e.target.value)}
                  className="w-full"
                />
              )}

              {field.type === 'password' && (
                <Input
                  id={field.name}
                  type="password"
                  placeholder={field.placeholder}
                  value={fieldApi.state.value}
                  onChange={(e) => handleChange(e.target.value)}
                  className="w-full"
                />
              )}

              {field.type === 'number' && (
                <Input
                  id={field.name}
                  type="number"
                  placeholder={field.placeholder}
                  value={fieldApi.state.value}
                  onChange={(e) => handleChange(e.target.value)}
                  className="w-full"
                />
              )}

              {field.type === 'textarea' && (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={fieldApi.state.value}
                  onChange={(e) => handleChange(e.target.value)}
                  className="w-full min-h-24"
                />
              )}

              {field.type === 'select' && (
                <Select
                  value={fieldApi.state.value}
                  onValueChange={handleChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.type === 'checkbox' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={field.name}
                    checked={fieldApi.state.value}
                    onCheckedChange={handleChange}
                  />
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {field.label}
                  </Label>
                </div>
              )}
              {field.type === 'link' && (
                <span
                  onClick={() =>
                    onFieldClick(field.name)
                  }
                  className={
                    field.className ||
                    'text-blue-600 hover:underline text-sm cursor-pointer'
                  }
                >
                  {field.label}
                </span>
              )}
              {fieldApi.state.meta.errors.length > 0 && (
                <FieldError field={fieldApi.state.meta} />
              )}
            </div>
          )
        }}
      </form.Field>
    )
  }

  const handleButtonClick = async (button) => {
    if (button.type === 'submit') {
      await form.handleSubmit()
    } else if (button.type === 'reset') {
      form.reset()
    }
  }

  return (
    <>
      <div
        className="grid gap-6 mb-6"
        style={{
          gridTemplateColumns: `repeat(${config.gridCols}, minmax(0, 1fr))`,
        }}
      >
        {config.fields.map(renderField)}
      </div>

      {config.buttons && (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${config.buttons?.gridCols || 2}, minmax(0, 1fr))`,
          }}
        >
          {config.buttons?.items?.map((ele: any, index: number) => (
            <Button
              key={index}
              type={ele.type}
              variant={ele.variant || 'default'}
              size={ele.size || 'default'}
              onClick={() => ele.type==="submit"? handleButtonClick(ele): onFieldClick(ele.name,ele.data)}
              className={ele.className}
              style={{
                gridColumn: `span ${ele.colSpan || 1} / span ${ele.colSpan || 1}`,
              }}
              icon={ele.icon}
              disabled={isSubmitting}
              isLoading={isSubmitting && ele.type === 'submit'}
              loadingText={ele.loadingText || 'Processing...'}
            >
              {ele.label}
            </Button>
          ))}
        </div>
      )}
    </>
  )
}

export default DynamicFormBuilder
