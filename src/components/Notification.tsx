import React, { useEffect, useRef, useState } from 'react'
import {
  Popover,
  IconButton,
  Typography,
  Button,
  Box,
  Divider,
  Badge,
} from '@mui/material'
import { GoBell } from 'react-icons/go'

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
      <IconButton onClick={handleClick} ref={iconRef}>
        <Badge color="error" variant="dot">
          <GoBell />
        </Badge>
      </IconButton>

      {/* Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            borderRadius: '0.5rem',
            p: '0.7rem',
            width: '15rem',
            boxShadow: 4,
          },
        }}
      >
        <Typography variant="body1" sx={{ fontSize: '0.875rem' }}>
          Investment services license is expiring today
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Box display="flex" justifyContent="space-between">
          <Button color="error" size="small" onClick={handleClose}>
            DISMISS
          </Button>
          <Button
            color="primary"
            size="small"
            variant="text"
            onClick={handleClose}
          >
            ACTION NOW
          </Button>
        </Box>
      </Popover>
    </>
  )
}
