import React, { useEffect, useRef, useState } from 'react'
import { IconButton, Typography, Box, Divider, Badge } from '@mui/material'
import { GoBell } from 'react-icons/go'
import Button from './ui/button'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover'

export default function Notification() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const iconRef = useRef<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  return (
    <>
      {/* Notification Icon with dot */}
      <span onClick={handleClick} className="!rounded-full"></span>
      <Popover>
        <PopoverTrigger>
          <div className="relative flex items-center justify-center w-10 h-10 cursor-pointer bg-gray-200 rounded-full">
            {/* Bell Icon */}
            <GoBell className="w-6 h-6 text-gray-700" />

            {/* Red Dot with Animation */}
            <span className="absolute top-1 right-1 block w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
            <span className="absolute top-1 right-1 block w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <div className="text-gray-600 text-sm">
            Investment services license is expiring today
          </div>

          <Divider sx={{ my: 1 }} />

          <div className="flex justify-around">
            <span
              onClick={handleClose}
              className="text-red-500 cursor-pointer text-sm hover:underline"
            >
              DISMISS
            </span>
            <span
              onClick={handleClose}
              className="text-[var(--brand-blue)] cursor-pointer text-sm hover:underline"
            >
              ACTION NOW
            </span>
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}
