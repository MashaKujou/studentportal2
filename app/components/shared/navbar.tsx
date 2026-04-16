"use client"

import type React from "react"

import { useAuth } from "@/app/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Bell, LogOut, User } from "lucide-react"
import Image from "next/image"
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
    <nav className="text-foreground shadow-md sticky top-0 z-40" style={{ backgroundColor: "#89cff0" }}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/header.png" alt="Header" width={44} height={44} className="h-11 w-11 rounded-md object-cover" />
          <Link href="/" className="font-bold text-lg bg-white text-foreground px-3 py-2 rounded-md shadow-sm">
            {title}
          </Link>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="bg-white text-foreground hover:bg-white/90">
              <Bell className="w-5 h-5" />
            </Button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-white text-foreground hover:bg-white/90"
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
