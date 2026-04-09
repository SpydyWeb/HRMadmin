import * as React from "react"

type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Content */}
      <div className="relative z-50">{children}</div>
    </div>
  )
}

export function DialogContent({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`bg-white rounded-lg shadow-lg w-full max-w-lg p-4 ${className}`}
    >
      {children}
    </div>
  )
}

export function DialogHeader({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="mb-4">{children}</div>
}

export function DialogTitle({
  children,
}: {
  children: React.ReactNode
}) {
  return <h2 className="text-lg font-semibold">{children}</h2>
}