import type { ReactNode } from 'react'
import { ToastOptions, Id } from 'react-toastify'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface CustomToastProps {
  type: ToastType
  title?: string
  message: string
  closeToast?: () => void
  actions?: ReactNode
  showIcon?: boolean
}

export interface ToastActionOptions extends Omit<ToastOptions, 'type'> {
  title?: string
  actions?: ReactNode
}

export interface PromiseMessages {
  pending: string
  success: string | ((data?: any) => string)
  error: string | ((error?: any) => string)
}
