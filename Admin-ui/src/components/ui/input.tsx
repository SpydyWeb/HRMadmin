import * as React from 'react'
import { Label } from './label'
import clsx from 'clsx'

interface InputProps extends React.ComponentProps<'input'> {
  variant?: 'outlined' | 'filled' | 'standard' | 'custom'| 'standardone'
  label: string
}
function Input({
  className,
  type,
  variant = 'custom',
  label = '',
  ...props
}: InputProps) {
  const variantsLabel = {
    outlined: '',
    filled: '',
    standard: 'mb-2 font-medium label-text text-[#9B9B9B]',
    standardone: 'mb-2 font-medium',
    custom: 'label-text text-[#9B9B9B] pt-[1%] pr-[1%] pb-[1%] pl-0',
  }
  const variantsContainer = {
    outlined: '',
    filled: '',
    standard: '',
    standardone: '',
    custom: 'bg-white border border-gray-200 rounded-xs p-6 shadow-sm w-full after:relative ',
  }
  const variantsInput = {
    outlined:
      'border border-gray-400 bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    filled:
      'dark:bg-zinc-800 border border-transparent focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px]',
    standard:
      'bg-white input-text border border-gray-400 rounded-none !px-3 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    standardone:
      'bg-white border border-gray-400 rounded-none !px-3 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    custom:
      'input-text font-poppins text-[24px] font-semibold text-black-500 border-none shadow-none rounded-none px-1 pb-1 text-black-500',
  }

  return (
    <div className={clsx(variantsContainer[variant])}>
      <Label htmlFor={props.name} className={clsx(variantsLabel[variant])}>
        {label}
      </Label>
      <input
        type={type}
        data-slot="input"
        className={clsx(
          // Base classes
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full  rounded-sm px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed md:text-sm',

          variantsInput[variant],

          // Error state
          'aria-invalid:ring-destructive/20 aria-invalid:border-destructive dark:aria-invalid:ring-destructive/40',

          className,
        )}
        {...props}
      />
    </div>
  )
}

export { Input }
