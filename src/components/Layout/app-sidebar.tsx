import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"


export function AppSidebar() {
  return (
    <Sidebar variant="floating" className="top-20 left-5 h-[calc(100vh-5rem)] w-64">
      <SidebarHeader />
     
      <SidebarContent >
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}