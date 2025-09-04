import React from 'react'
import { AppSidebar } from "./app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import Header from "./Header"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <Header />
      {/* <AppSidebar /> */}
      <SidebarInset className='ml-0'>
        <main className="pt-20 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}