
import React from 'react'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { RxDashboard } from "react-icons/rx";
import { BiBuildings } from "react-icons/bi";
import { VscTypeHierarchySuper } from "react-icons/vsc";
import { LiaCertificateSolid } from "react-icons/lia";
import { FaRegClock } from "react-icons/fa6";
import { TfiBarChart } from "react-icons/tfi";
import { IoBookOutline,IoSettingsOutline } from "react-icons/io5";
import { TiDatabase } from "react-icons/ti";
import { Link, useNavigate } from '@tanstack/react-router';
import { RoutePaths } from '@/utils/constant';

const drawerWidth = "16rem"

export const  MenuItems = [
  { text: 'Dashboard', icon: <RxDashboard />,urlPath:RoutePaths.DASHBOARD, active: true },
  { text: 'Entity Management', icon: <BiBuildings /> ,urlPath:RoutePaths.ENTITYMANAGEMENT},
  { text: 'Hierarchy Tools', icon: <VscTypeHierarchySuper />,urlPath:RoutePaths.HIERARCYTOOLS },
  { text: 'Certifications', icon: <LiaCertificateSolid />,urlPath:RoutePaths.CERTIFICATIONS },
  { text: 'Pending Actions', icon: <FaRegClock />,urlPath:RoutePaths.PENDINGACTIONS },
  { text: 'Channel Reports', icon: <TfiBarChart /> ,urlPath:RoutePaths.CHANNELREPORTS},
  { text: 'Resources', icon: <IoBookOutline />,urlPath:RoutePaths.RESOURCES },
  { text: 'CMS/ICMS / Queries', icon: <TiDatabase />,urlPath:RoutePaths.CMS },
  { text: 'Setting', icon: <IoSettingsOutline /> ,urlPath:RoutePaths.SETTING},
]

export default function Sidebar() {
  const theme = useTheme()
  const activeColor = theme.palette.secondary.main 
 const navigate = useNavigate()
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#fff',
          borderRight: '1px solid #eee',
          borderRadius: '0.6rem',
          pt: 1.5,
        top: '6rem', 
        height: 'calc(100vh - 6rem)', 
        left:'2rem'
        },
      }}
    >
      <List sx={{ px: 0.5 }}>
       {MenuItems.map((item:any) => (
          <ListItem key={item.text} disablePadding className='mb-2' >
            <ListItemButton
              selected={!!item.active}
              sx={{
                mx: '0.8rem',
                borderRadius: '0.3rem',
                minHeight: '0.5rem',
                padding: '0.1rem',
                bgcolor: item.active ? activeColor : 'transparent',
                '&.Mui-selected': { bgcolor: activeColor },
                '&.Mui-selected:hover': { bgcolor: activeColor },
                '&:hover': {
                  bgcolor: alpha(theme.palette.secondary.main, 0.20),
                },
              }}
              onClick={() => {
                navigate({ to: item.urlPath })
              } }
            >
              <ListItemIcon sx={{ minWidth: 44 }}>
                <Box
                  sx={{
                    width: '2.5rem',
                    height: '2.5rem',
                     display: 'grid',
                    placeItems: 'center',
                    color: item.active ? 'white' : 'black',
                    // keep icon sizes consistent
                    '& svg': { fontSize: 16 },
                  }}
                >
                  {item.icon}
                </Box>
              </ListItemIcon>

              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '1.1rem',
          
                  color: item.active ? 'white' : theme.palette.text.primary,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      </Drawer>
  )
}
