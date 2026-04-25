"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { messagingService, type Notification } from "@/app/services/messaging-service"
import { useAuth } from "@/app/contexts/auth-context"
import { useRouter } from "next/navigation"

type FilterType = "all" | "unread" | "read"

const filters: { id: FilterType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
]

const getTimeAgo = (isoTime: string) => {
  const diffMs = Date.now() - new Date(isoTime).getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diffMs < hour) {
    const mins = Math.max(1, Math.floor(diffMs / minute))
    return `${mins} minute${mins > 1 ? "s" : ""} ago`
  }
  if (diffMs < day) {
    const hours = Math.max(1, Math.floor(diffMs / hour))
    return `${hours} hour${hours > 1 ? "s" : ""} ago`
  }
  const days = Math.max(1, Math.floor(diffMs / day))
  return `${days} day${days > 1 ? "s" : ""} ago`
}

export const TeacherNotifications = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all")
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!user) return

    const loadNotifications = () => {
      const rows = messagingService
        .getNotifications(user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setNotifications(rows)
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 2000)
    return () => clearInterval(interval)
  }, [user])

  const filteredNotifications = useMemo(() => {
    if (currentFilter === "all") return notifications
    if (currentFilter === "unread") return notifications.filter((item) => !item.isRead)
    return notifications.filter((item) => item.isRead)
  }, [currentFilter, notifications])

  const handleMarkAsRead = (notificationId: string) => {
    messagingService.markNotificationAsRead(notificationId)
    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)),
    )
  }

  const getTargetPath = (item: Notification) => {
    if (item.targetPath) return item.targetPath
    const text = `${item.title} ${item.message}`.toLowerCase()
    if (text.includes("grade")) return "/teacher/grade-input"
    if (text.includes("class")) return "/teacher/classes"
    return "/teacher/notifications"
  }

  const handleNotificationClick = (item: Notification) => {
    handleMarkAsRead(item.id)
    router.push(getTargetPath(item))
  }

  return (
    <div className="space-y-5 py-2">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-medium">Notifications</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setCurrentFilter(filter.id)}
            className={`rounded-full border px-4 py-1.5 text-xs sm:text-sm transition-colors ${
              currentFilter === filter.id
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No notifications for this filter yet.
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <Card
              key={item.id}
              className="border cursor-pointer transition-colors hover:bg-muted/30"
              onClick={() => handleNotificationClick(item)}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          item.isRead ? "bg-muted text-muted-foreground" : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.isRead ? "Read" : "Unread"}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.message}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">{getTimeAgo(item.createdAt)}</p>
                  </div>
                  {!item.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleMarkAsRead(item.id)
                      }}
                      className="h-8 px-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
