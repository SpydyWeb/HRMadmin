import React from 'react'
import clsx from 'clsx'

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
}

export default function Button({
  children,
  variant = 'green',
  size = 'md',
  onClick,
  className,
}: ButtonProps) {
  const baseStyles =
    'flex items-center gap-2 !font-normal cursor-pointer rounded-sm font-semibold transition duration-200'

  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-1.5 text-base',
    lg: 'px-5 py-3 text-lg',
  }

  const variants = {
    default: 'bg-gray-200 text-gray-700 ',
    red: 'bg-white text-red-600 border border-red-400 hover:bg-red-100',
    green: 'bg-[var(--brand-green)] text-white hover:brightness-110',
    orange: 'bg-[var(--brand-orange)] text-white hover:brightness-110',
    blue: 'bg-[var(--brand-blue)] text-white hover:brightness-110',

    outline: 'border border-gray-700 bg-gray-50 text-gray-700 ',
    'outline-red': 'border border-red-400 text-red-500 hover:bg-red-50',
    'outline-green':
      'border border-[var(--brand-green)] text-[var(--brand-green)] hover:bg-green-50',
    'outline-orange':
      'border border-[var(--brand-orange)] text-[var(--brand-orange)] hover:bg-orange-50',
    'outline-blue':
      'border border-[var(--brand-blue)] text-[var(--brand-blue)] hover:bg-blue-50',
        ghost: 'bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/20',
 
  }

  return (
    <button
      onClick={onClick}
      className={clsx(baseStyles, sizes[size], variants[variant], className)}
    >
      {children}
    </button>
  )
}
