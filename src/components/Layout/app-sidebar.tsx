import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { RxDashboard } from "react-icons/rx"
import { BiBuildings } from "react-icons/bi"
import { VscTypeHierarchySuper } from "react-icons/vsc"
import { LiaCertificateSolid } from "react-icons/lia"
import { FaRegClock } from "react-icons/fa6"
import { TfiBarChart } from "react-icons/tfi"
import { IoBookOutline, IoSettingsOutline } from "react-icons/io5"
import { TiDatabase } from "react-icons/ti"
import { useNavigate, useLocation } from '@tanstack/react-router'
import { RoutePaths } from '@/utils/constant'
import { use, useContext } from 'react'
import { SidebarContext } from "@/components/ui/sidebar"
import { useTheme } from "@mui/material"

// Menu items
const items = [
  {
    title: "Dashboard",
    url: RoutePaths.DASHBOARD,
    icon: RxDashboard,
  },
  {
    title: "Entity Management",
    url: RoutePaths.ENTITYMANAGEMENT,
    icon: BiBuildings,
  },
  {
    title: "Hierarchy Tools",
    url: RoutePaths.HIERARCYTOOLS,
    icon: VscTypeHierarchySuper,
  },
  {
    title: "Certifications",
    url: RoutePaths.CERTIFICATIONS,
    icon: LiaCertificateSolid,
  },
  {
    title: "Pending Actions",
    url: RoutePaths.PENDINGACTIONS,
    icon: FaRegClock,
  },
  {
    title: "Channel Reports",
    url: RoutePaths.CHANNELREPORTS,
    icon: TfiBarChart,
  },
  {
    title: "Resources",
    url: RoutePaths.RESOURCES,
    icon: IoBookOutline,
  },
  {
    title: "CMS/ICMS / Queries",
    url: RoutePaths.CMS,
    icon: TiDatabase,
  },
  {
    title: "Settings",
    url: RoutePaths.SETTING,
    icon: IoSettingsOutline,
  },
]

export function AppSidebar() {
  const theme=useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { open } = useContext(SidebarContext)

  return (
    <Sidebar variant="floating" className="top-16 left-4 h-[calc(100vh-5rem)]">
      <div className="absolute top-5 z-10" style={{right:  '-0.7rem' }} >
      <SidebarTrigger />
      </div>
      {/* <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 text-white font-bold text-sm">
            HM
          </div>
          {open && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Hierarchy Management</span>
              <span className="truncate text-xs text-sidebar-foreground/70">Admin Portal</span>
            </div>
          )}
        </div>
      </SidebarHeader> */}
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu >
              {items.map((item) => {
                const isActive = location.pathname === item.url
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      className="group"
                      theme={theme}
                    >
                      <button
                        onClick={() => navigate({ to: item.url })}
                        className="flex items-center gap-3 w-full"
                        title={!open ? item.title : ''}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {open && <span className="truncate">{item.title}</span>}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {/* <SidebarFooter className="border-t border-sidebar-border p-4">
        {open && (
          <div className="text-xs text-sidebar-foreground/70">
            © 2025 Hierarchy Management
          </div>
        )}
      </SidebarFooter> */}
      
      <SidebarRail />
    </Sidebar>
  )
}
