/** @jsxImportSource react */
import * as React from "react"
import { cn } from "@/lib/utils"
import { createContext, useContext, useState } from "react"
import { FiMenu, FiX } from "react-icons/fi"
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io"

export const SidebarContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  variant: "default" | "floating"
}>({
  open: true,
  setOpen: () => {},
  variant: "default"
})

export function SidebarProvider({ 
  children, 
  defaultOpen = true,
  ...props 
}: { 
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  
  return (
    <SidebarContext.Provider value={{ open, setOpen, variant: "floating" }}>
      <div className="relative flex min-h-screen">
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export function Sidebar({
  className,
  variant = "default",
  children,
  ...props
}: {
  className?: string
  variant?: "default" | "floating"
  children: React.ReactNode
}) {
  const { open } = useContext(SidebarContext)
  
  return (
    <aside
      className={cn(
        "fixed z-40 bg-background border-r border-border transition-all duration-300",
        variant === "floating" && "rounded-xl shadow-lg border m-4",
        variant === "floating" ? "top-16 left-0 h-[calc(100vh-5rem)]" : "top-0 left-0 h-screen",
        open ? "w-64" : "w-16",
        className
      )}
      {...props}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {children}
      </div>
    </aside>
  )
}

export function SidebarHeader({ className, children, ...props }: { className?: string, children: React.ReactNode }) {
  const { open } = useContext(SidebarContext)
  
  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-4 py-3 border-b",
        !open && "justify-center px-2",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarContent({ className, children, ...props }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("flex-1 overflow-auto py-2", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarFooter({ className, children, ...props }: { className?: string, children: React.ReactNode }) {
  const { open } = useContext(SidebarContext)
  
  return (
    <div 
      className={cn(
        "border-t p-4",
        !open && "text-center px-2",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarGroup({ children }: { children: React.ReactNode }) {
  return <div className="px-2">{children}</div>
}

export function SidebarGroupContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <nav className="space-y-1 p-1">{children}</nav>
}

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function SidebarMenuButton({
  asChild,
  isActive,
  className,
  children,
  ...props
}: {
  asChild?: boolean
  isActive?: boolean
  className?: string
  children: React.ReactNode
}) {
  const { open } = useContext(SidebarContext)
  
  if (asChild) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 text-sm rounded-sm transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          isActive && "text-accent-foreground font-medium",
          !open && "justify-center px-2",
          className
        )}
        style={{backgroundColor: isActive ? 'var(--brand-blue)' : undefined, color: isActive ? 'white' : undefined}}
      >
        {children}
      </div>
    )
  }
  
  return (
    <button
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors w-full text-left",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground font-medium",
        !open && "justify-center px-2",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function SidebarTrigger({ className, ...props }: { className?: string }) {
  const { open, setOpen } = useContext(SidebarContext)
  
  return (
    <button
      onClick={() => setOpen(!open)}
      className={cn(
        "flex items-center cursor-pointer justify-center h-5 w-5 rounded-full hover:bg-accent hover:text-white transition-colors text-white",
        className
      )}
      style={{backgroundColor:"var(--brand-orange)"}}
      {...props}
    >
      {open ? <IoIosArrowBack className="h-4 w-4 " /> :
      <IoIosArrowForward className="h-4 w-4 "/>}
    </button>
  )
}

export function SidebarInset({ className, children, ...props }: { className?: string, children: React.ReactNode }) {
  const { open } = useContext(SidebarContext)
  
  return (
    <div
      className={cn(
        "flex-1 transition-all duration-300",
        open ? "ml-72" : "ml-20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarRail() {
  return null // Not needed for floating variant
}
