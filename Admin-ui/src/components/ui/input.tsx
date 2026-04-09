import * as React from 'react'
import { Label } from './label'
import clsx from 'clsx'

interface InputProps extends React.ComponentProps<'input'> {
  variant?: 'outlined' | 'filled' | 'standard' | 'custom' | 'standardone' | "searchVariant"
  label: string
  description?: string   // ✅ NEW PROP
}

function Input({
  className,
  type,
  variant = 'custom',
  label = '',
  description = '',   // ✅ default
  ...props
}: InputProps) {
  const variantsLabel = {
    outlined: '',
    filled: '',
    searchVariant: '',
    standard: 'mb-1 font-medium label-text text-[#9B9B9B]',
    standardone: 'mb-1 font-medium',
    custom: 'label-text text-[#9B9B9B] pt-[1%] pr-[1%] pb-[1%] pl-0',
  }

  const variantsContainer = {
    outlined: '',
    filled: '',
    standard: '',
    standardone: '',
    searchVariant: '',
    custom: 'bg-white border border-gray-200 rounded-xs p-6 shadow-sm w-full',
  }

  const variantsInput = {
    outlined:
      'border border-gray-400 bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    searchVariant:
      'border border-gray-400 bg-white focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    filled:
      'dark:bg-zinc-800 border border-transparent focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px]',
    standard:
      'bg-white input-text border border-gray-400 rounded-none !px-3 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    standardone:
      'bg-white border border-gray-400 rounded-none !px-3 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    custom:
      'input-text font-poppins text-[24px] font-semibold text-black-500 border-none !shadow-none rounded-none px-1 pb-1',
  }

  return (
    <div className={clsx(variantsContainer[variant])}>
      {/* Label */}
      <Label htmlFor={props.name} className={clsx(variantsLabel[variant])}>
        {label}
      </Label>

      {/* ✅ Description */}
      {description && (
        <p className="mb-2 text-xs text-neutral-500">
          {description}
        </p>
      )}

      {/* Input */}
      <input
        type={type}
        data-slot="input"
        className={clsx(
          'placeholder:text-muted-foreground flex h-9 w-full rounded-sm px-3 py-1 text-base shadow-xs outline-none md:text-sm',
          variantsInput[variant],
          'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
          className
        )}
        {...props}
      />
    </div>
  )
}

export { Input }