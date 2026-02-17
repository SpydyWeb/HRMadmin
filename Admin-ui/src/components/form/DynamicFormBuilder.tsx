import React from 'react'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { FieldError } from './field-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Button from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import DatePicker from '../ui/date-picker'
import { TimePicker } from '../ui/time-picker'
import { DateTimePicker } from '../ui/date-timepicker'
import { Variable } from 'lucide-react'
import { MaskedInput } from '@/components/ui/masked-input'

interface DynamicFormBuilderProps {
  config: any
  onSubmit: (data: Record<string, any>) => void
  onFieldClick?: (fieldName: string, data?: Array<any>) => void
  defaultValues?: Record<string, any>
}
const DynamicFormBuilder: React.FC<DynamicFormBuilderProps> = ({
  config,
  onSubmit,
  onFieldClick = () => {},
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Helper function to recursively sanitize default values
  const sanitizeValues = (values: Record<string, any>) => {
    if (!values) return {}
    return Object.entries(values).reduce(
      (acc, [key, value]) => {
        // Convert null to undefined so Zod optional() validation works
        acc[key] = value === null ? undefined : value
        return acc
      },
      {} as Record<string, any>,
    )
  }

  const form = useForm({
    defaultValues: {
      ...config.fields.reduce((acc: any, field: any) => {
        acc[field.name] =
          field.type === 'checkbox' ? false : field.type === 'number' ? 0 : ''
        return acc
      }, {}),

      ...sanitizeValues(config.defaultValues || {}),
    },
    onSubmit: async ({ value }) => {
      console.log('✅ Form submitted with values:', value)
      if (!onSubmit) {
        console.warn('⚠️ onSubmit prop is missing in DynamicFormBuilder')
        return
      }

      setIsSubmitting(true)
      try {
        await onSubmit(value)
      } catch (error) {
        console.error('❌ Error in onSubmit:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    onSubmitInvalid: ({ value, formApi }) => {
      console.error('❌ Form validation failed!')
      console.error('Values:', value)
      // Helper to log actual errors
      const errors = formApi.state.fieldMeta
      Object.keys(errors).forEach((key) => {
        if (errors[key].errors && errors[key].errors.length > 0) {
          console.error(`Field '${key}' Error:`, errors[key].errors)
        }
      })
      console.error('Full Error Meta:', errors)
    },
    validatorAdapter: zodValidator,



    
  })

  const linkField = config.fields.find((field: any) => field.type === 'link')
  const fieldsToRender = config.fields.filter(
    (field: any) => field.type !== 'link',
  )

  const renderField = (field: any) => {
    const fieldSchema = config.schema.shape[field.name]

    return (
      <form.Field
        key={field.name}
        name={field.name}
        // validators={{
        //   onChange: fieldSchema,
        // }}
      >
        {(fieldApi) => {
          const handleChange = (value: any) => {
            if (field.type === 'number') {
              fieldApi.handleChange(value === '' ? 0 : Number(value))
            } else {
              fieldApi.handleChange(value)
            }
          }

          return (
            <div
              style={{
                gridColumn: `span ${field.colSpan} / span ${field.colSpan}`,
              }}
            >
              {![
                'text',
                'email',
                'password',
                'number',
                'checkbox',
                'link',
                'select',
                'masked',
              ].includes(field.type) && (
                <Label
                  htmlFor={field.name}
                  className="label-text text-gray-400 font-semibold pt-[1%] pr-[1%] pb-[1%] pl-0"
                >
                  {field.label}
                </Label>
              )}

              {field.type === 'masked' && (
                <MaskedInput
                  id={field.name}
                  value={fieldApi.state.value}
                  onChange={(value) => fieldApi.handleChange(value)}
                  placeholder={field.placeholder}
                  readOnly={field.readOnly}
                  disabled={field.readOnly}
                  variant={field.variant}
                  className="w-full h-10 pl-0 pr-3 py-2"
                  label={field.label}
                />
              )}

              {['text', 'email', 'password', 'number'].includes(field.type) && (
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={fieldApi.state.value}
                  onChange={(e) =>
                    fieldApi.handleChange(
                      field.type === 'number'
                        ? Number(e.target.value)
                        : e.target.value,
                    )
                  }
                  readOnly={field.readOnly}
                  disabled={field.readOnly}
                  variant={field.variant}
                  className="w-full h-10 pl-0 pr-3 py-2"
                  label={field.label}
                />
              )}

              {field.type === 'textarea' && (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={fieldApi.state.value}
                  onChange={(e) => handleChange(e.target.value)}
                  className="w-full min-h-24 px-3 py-2"
                  readOnly={field.readOnly}
                  disabled={field.readOnly}
                  variant={field.variant}
                />
              )}

              {/* {field.type === 'select' && (
                <div className={field.variant==='custom' ? `!bg-red`:''}>
                <Select
                  value={fieldApi.state.value}
                  onValueChange={handleChange}
                  disabled={field.readOnly}
                >
                  <SelectTrigger className='!w-full !h-10 px-3 py-2' variant={field.variant}>
                    <SelectValue  placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent >
                    {field.options?.map((option: any) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>
              )} */}
              {field.type === 'select' && (
                <div
                  className={
                    field.variant === 'custom'
                      ? 'bg-white rounded-sm p-[3.5%] shadow-sm border border-gray-200'
                      : ''
                  }
                >
                  <Select
                    value={fieldApi.state.value}
                    // onValueChange={handleChange}
                    onValueChange={(val) => fieldApi.handleChange(val)}
                    disabled={field.readOnly}
                  >
                    <SelectGroup>
                      <SelectLabel variant={field.variant}>
                        {field.label}
                      </SelectLabel>
                      <SelectTrigger
                        className={
                          field.variant === 'custom'
                            ? '!w-full !h-10 px-1 py-1'
                            : '!w-full !h-10 px-3 py-3'
                        }
                        variant={field.variant}
                      >
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option: any) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectGroup>
                  </Select>
                </div>
              )}

              {field.type === 'checkbox' && (
                <div className="flex items-center space-x-2 py-2">
                  {' '}
                  {/* Added vertical padding */}
                  <Checkbox
                    id={field.name}
                    checked={fieldApi.state.value}
                    onCheckedChange={handleChange}
                    disabled={field.readOnly}
                    className="h-4 w-4" // Added consistent size
                  />
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {field.label}
                  </Label>
                </div>
              )}

              {field.type === 'date' && (
                <div className="">
                  {' '}
                  {/* Added vertical padding */}
                  <DatePicker
                    value={fieldApi.state.value}
                    onChange={(d) => fieldApi.handleChange(d)}
                    icon={field.icon}
                    disabled={field.readOnly}
                    // className="w-full h-7" // Added consistent height
                  />
                </div>
              )}

              {field.type === 'time' && (
                <div className="py-1">
                  {' '}
                  {/* Added vertical padding */}
                  <TimePicker
                    value={fieldApi.state.value}
                    onChange={(t: any) => fieldApi.handleChange(t)}
                    className="w-full h-10" // Added consistent height
                  />
                </div>
              )}

              {field.type === 'datetime' && (
                <div className="py-1">
                  {' '}
                  {/* Added vertical padding */}
                  <DateTimePicker
                    value={fieldApi.state.value}
                    onChange={(v: any) => fieldApi.handleChange(v)}
                    className="w-full h-10" // Added consistent height
                  />
                </div>
              )}

              {field.type === 'link' && (
                <span
                  onClick={() => onFieldClick(field.name)}
                  className={
                    field.className ||
                    'text-blue-600 hover:underline text-sm cursor-pointer py-2'
                  }
                >
                  {field.label}
                </span>
              )}

              {field.type === 'boolean' && (
                <div className="bg-tranparent px-1 py-2">
                  <Switch
                    id={field.name}
                    checked={fieldApi.state.value ?? false}
                    onCheckedChange={(val) => fieldApi.handleChange(val)}
                    disabled={field.readOnly}
                    containerClassName="font-poppins"
                  />
                </div>
              )}

              {/* {fieldApi.state.meta.errors.length > 0 && (
    <FieldError field={fieldApi.state.meta} />
  )} */}
            </div>
          )
        }}
      </form.Field>
    )
  }

  const handleButtonClick = async (button: any) => {
    if (button.type === 'submit') {
      console.log('clicked submit button')
      await form.handleSubmit()
    } else if (button.type === 'reset') {
      form.reset()
    }
  }

  return (
    <>
      <div
        className="grid gap-6 w-[100%]"
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
              onClick={() => {
                if (ele.type === 'submit') {
                  console.log('Submitting form...')
                  handleButtonClick(ele)
                } else {
                  onFieldClick(ele.name, ele.data)
                }
              }}
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
      {linkField && (
        <div className="!text-end mt-4">
          <span
            onClick={() => onFieldClick(linkField.name)}
            className={
              linkField.className ||
              'text-blue-600 hover:underline text-sm cursor-pointer'
            }
          >
            {linkField.label}
          </span>
        </div>
      )}
    </>
  )
}

export default DynamicFormBuilder
