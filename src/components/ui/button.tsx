import React from 'react'
import clsx from 'clsx'
import { TbLoader2 } from 'react-icons/tb'
import { useStore } from '@tanstack/react-store'
import { useFormContext } from '../form'

type ButtonProps = {
  children: React.ReactNode
  variant?:
    | 'default'
    | 'red'
    | 'green'
    | 'orange'
    | 'blue'
    | 'outline'
    | 'outline-red'
    | 'outline-green'
    | 'outline-orange'
    | 'outline-blue'
    | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
  loadingText?: string
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  isLoading?: boolean // ✅ for manual loading state without form
}

export default function Button({
  children,
  variant = 'green',
  size = 'md',
  onClick,
  className,
  loadingText = 'Processing...',
  icon,
  iconRight,
  type = 'button',
  disabled = false,
  isLoading = false,
}: ButtonProps) {
  let form: any = null
  try {
    // Try getting form context if inside AppForm
    form = useFormContext()
  } catch {
    form = null
  }

  const [isSubmitting, canSubmit] = form
    ? useStore(form.store, (state: any) => [state.isSubmitting, state.canSubmit])
    : [false, true] // Default fallback values

  const baseStyles =
    'flex items-center justify-center gap-2 font-semibold cursor-pointer rounded-sm transition duration-200'

  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-1.5 text-base',
    lg: 'px-5 py-3 text-lg',
  }

  const variants = {
    default: 'bg-gray-200 text-gray-700',
    red: 'bg-white text-red-600 border border-red-400 hover:bg-red-100',
    green: 'bg-[var(--brand-green)] text-white hover:brightness-110',
    orange: 'bg-[var(--brand-orange)] text-white hover:brightness-110',
    blue: 'bg-[var(--brand-blue)] text-white hover:brightness-110',

    outline: 'border border-gray-700 bg-gray-50 text-gray-700',
    'outline-red': 'border border-red-400 text-red-500 hover:bg-red-50',
    'outline-green':
      'border border-[var(--brand-green)] text-[var(--brand-green)] hover:bg-green-50',
    'outline-orange':
      'border border-[var(--brand-orange)] text-[var(--brand-orange)] hover:bg-orange-50',
    'outline-blue':
      'border border-[var(--brand-blue)] text-[var(--brand-blue)] hover:bg-blue-50',
    ghost:
      'bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/20',
  }

  const isButtonDisabled = disabled || (!canSubmit && form) || isSubmitting
  const showLoader = isSubmitting || isLoading

  return (
    <button
      type={type}
      disabled={isButtonDisabled}
      onClick={onClick}
      className={clsx(
        baseStyles,
        sizes[size],
        variants[variant],
        isButtonDisabled && 'bg-gray-400 !cursor-not-allowed hover:!none',
        className
      )}
    >
      {showLoader ? (
        <div className="flex items-center justify-center gap-2">
          <TbLoader2 className="w-5 h-5 animate-spin" />
          {loadingText}
        </div>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {icon}
          {children}
          {iconRight}
        </span>
      )}
    </button>
  )
}
