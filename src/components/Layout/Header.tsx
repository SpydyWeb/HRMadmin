import React from 'react'
import { IoMdLock } from 'react-icons/io'
import { FiBell } from 'react-icons/fi'
import { auth } from '@/auth'
import { useNavigate } from '@tanstack/react-router'
import { Separator } from "@/components/ui/separator"

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
          <button className="relative p-2 rounded-full hover:bg-accent transition-colors duration-200 bg-gray-200">
            <FiBell className="w-5 h-5" />
            <span className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-xs rounded-full w-2 h-2 flex items-center justify-center">
              1
            </span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 bg-orange-50 px-3 py-2 rounded-lg">
            <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || 'M'}
            </div>
            <span className="text-orange-700 font-medium">{user?.name || 'Manish'}</span>
          </div>

          {/* Reset Password Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            <IoMdLock className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
