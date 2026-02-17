import React, { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface MaskedInputProps {
  value: string | undefined
  
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  disabled?: boolean
  variant?: string
  className?: string
  label?: string
  id?: string
}


const maskValue = (value: string | undefined): string => {
  if (!value) return ''
  return '•'.repeat(value.length)
}

export const MaskedInput: React.FC<MaskedInputProps> = ({
  value,
  onChange,
  placeholder,
  readOnly = false,
  disabled = false,
  variant,
  className,
  label,
  id,
}) => {
  const [isVisible, setIsVisible] = useState(false)

  const handleToggleVisibility = () => {
    if (!disabled) {
      setIsVisible(!isVisible)
    }
  }

  const displayValue = isVisible ? value || '' : maskValue(value)

  return (
    <div className="relative w-full">
      <Input
        id={id}
        type="text"
        value={displayValue}
        onChange={(e) => {
          if (isVisible && !readOnly) {
            onChange(e.target.value)
          }
        }}
        placeholder={placeholder}
        readOnly={readOnly || !isVisible}
        disabled={disabled}
        variant={variant}
        className={cn('pr-10', className)}
        label={label}
      />
      {!disabled && (
        <button
          type="button"
          onClick={handleToggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none pt-4"
          aria-label={isVisible ? 'Hide account number' : 'Show account number'}
        >
          {isVisible ? (
            <FiEyeOff className="w-5 h-5" />
          ) : (
            <FiEye className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  )
}
