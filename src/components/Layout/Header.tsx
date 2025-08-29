import React from 'react'
import { IoMdLock } from 'react-icons/io'
import { FiBell } from 'react-icons/fi'
import { auth } from '@/auth'
import { useNavigate } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import Button from '../ui/button'
import Notification from '../Notification'

export default function Header() {
  const navigate = useNavigate()
  const user = auth.getCurrentUser()

  const handleLogout = () => {
    auth.logout()
    navigate({ to: '/login' })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side with sidebar trigger and logo */}
        <div className="flex items-center gap-4">
          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 w-10 h-10 font-bold text-white flex items-center justify-center rounded-lg">
              HM
            </div>
            <span className="text-xl font-bold">Hierarchy Management</span>
          </div>
        </div>

        {/* Right side with notifications and user info */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <Notification/>
                   {/* User Profile */}
          <div
            className="inline-flex  px-3 py-1 rounded-full text-white font-medium gap-2 items-center cursor-pointer"
            style={{ backgroundColor: 'var(--brand-orange)' }}
          >
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span>{user?.name || 'Manish'}</span>
          </div>

          {/* Reset Password Button */}
          <Button
            onClick={handleLogout}
            variant="default"
            className="!rounded-full !font-medium"
          >
            <IoMdLock className="w-4 h-4" />
            <span>Reset Password</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
