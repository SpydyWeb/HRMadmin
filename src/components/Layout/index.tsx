import { AppSidebar } from "./app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import Header from "./Header"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
        <Header/>
      <AppSidebar />
      <main>
        <SidebarTrigger />
       
        {children}
      </main>
    </SidebarProvider>
  )
}