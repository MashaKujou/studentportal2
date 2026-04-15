"use client"

import type React from "react"

import { useAuth } from "@/app/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Bell, LogOut, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export const Navbar: React.FC<{ title?: string }> = ({ title = "Student Portal" }) => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <nav className="bg-primary text-primary-foreground shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          {title}
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80">
              <Bell className="w-5 h-5" />
            </Button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/80"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">{user.firstName} {user.middleName ? `${user.middleName.charAt(0)}.` : ""} {user.lastName}</span>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-background text-foreground rounded-lg shadow-lg border border-border">
                  <div className="p-4 border-b border-border">
                    <p className="font-semibold text-sm">
                      {user.firstName} {user.middleName ? `${user.middleName} ` : ""}{user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
