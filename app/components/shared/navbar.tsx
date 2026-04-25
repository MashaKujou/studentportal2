"use client"

import type React from "react"

import { useAuth } from "@/app/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Bell, LogOut, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { messagingService, type Notification } from "@/app/services/messaging-service"

export const Navbar: React.FC<{ title?: string }> = ({ title = "Student Portal" }) => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!user) return

    const loadNotifications = () => {
      const userNotifications = messagingService
        .getNotifications(user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setNotifications(userNotifications)
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 2000)
    return () => clearInterval(interval)
  }, [user])

  const unreadCount = notifications.filter((item) => !item.isRead).length

  const handleMarkAsRead = (notificationId: string) => {
    messagingService.markNotificationAsRead(notificationId)
    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)),
    )
  }

  const getFallbackNotificationPath = (notification: Notification) => {
    if (notification.targetPath) return notification.targetPath
    const text = `${notification.title} ${notification.message}`.toLowerCase()
    const role = user?.role

    if (text.includes("finance") || text.includes("fee") || text.includes("tuition") || text.includes("payment")) {
      if (role === "student") return "/student/financial"
      if (role === "admin" || role === "super_admin") return "/admin/financial"
      if (role === "teacher") return "/teacher/notifications"
    }

    if (text.includes("grade")) {
      if (role === "student") return "/student/grades"
      if (role === "teacher") return "/teacher/grade-input"
      if (role === "admin" || role === "super_admin") return "/admin/grade-approval"
    }

    if (text.includes("request")) {
      if (role === "student") return "/student/requests"
      if (role === "admin" || role === "super_admin") return "/admin/requests"
    }

    if (role === "student") return "/student/notifications"
    if (role === "teacher") return "/teacher/notifications"
    if (role === "admin" || role === "super_admin") return "/admin/notifications"
    return "/"
  }

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id)
    const targetPath = getFallbackNotificationPath(notification)
    setShowNotifications(false)
    router.push(targetPath)
  }

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
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNotifications((prev) => !prev)
                  setShowMenu(false)
                }}
                className="relative bg-white text-foreground hover:bg-white/90"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg border border-border bg-background text-foreground shadow-lg">
                  <div className="sticky top-0 z-10 border-b border-border bg-background px-4 py-3">
                    <p className="text-sm font-semibold">Notifications</p>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {notifications.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleNotificationClick(item)}
                          className={`w-full px-4 py-3 text-left transition-colors hover:bg-muted/60 ${item.isRead ? "bg-background" : "bg-blue-50/50"}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{item.title}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{item.message}</p>
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                {new Date(item.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {!item.isRead && <span className="text-[11px] font-medium text-blue-700">Unread</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowMenu(!showMenu)
                  setShowNotifications(false)
                }}
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
