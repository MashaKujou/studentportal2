"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, ClipboardList, GraduationCap, Megaphone, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { storage, userStorage } from "@/lib/storage"
import { STORAGE_KEYS } from "@/lib/constants"
import { messagingService } from "@/app/services/messaging-service"
import { useAuth } from "@/app/contexts/auth-context"

type AudienceFilter = "all" | "general" | "teacher" | "student" | "finance"
type Audience = Exclude<AudienceFilter, "all">
type ManualAudience = "general" | "teacher" | "student"

interface AdminNotificationItem {
  id: string
  title: string
  desc: string
  audience: Audience
  createdAt: string
  financeCourseOrStrand?: string
  financeYear?: string
}

const ADMIN_NOTIFICATION_BOARD_KEY = "student_portal_admin_notifications_board"
const NOTIFICATIONS_CLEANUP_DONE_KEY = "student_portal_notifications_cleanup_done"

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

const tabItems: { id: AudienceFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "general", label: "General" },
  { id: "teacher", label: "Teachers" },
  { id: "student", label: "Students" },
  { id: "finance", label: "Finance" },
]

const audienceConfig: Record<
  Audience,
  {
    label: string
    icon: React.ReactNode
    iconClass: string
    badgeClass: string
  }
> = {
  general: {
    label: "General",
    icon: <Megaphone className="h-4 w-4" />,
    iconClass: "bg-blue-100 text-blue-700",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  teacher: {
    label: "Teachers",
    icon: <ClipboardList className="h-4 w-4" />,
    iconClass: "bg-indigo-100 text-indigo-700",
    badgeClass: "bg-indigo-100 text-indigo-700",
  },
  student: {
    label: "Students",
    icon: <GraduationCap className="h-4 w-4" />,
    iconClass: "bg-green-100 text-green-700",
    badgeClass: "bg-green-100 text-green-700",
  },
  finance: {
    label: "Finance",
    icon: <Wallet className="h-4 w-4" />,
    iconClass: "bg-amber-100 text-amber-700",
    badgeClass: "bg-amber-100 text-amber-700",
  },
}

export const AdminNotifications = () => {
  const { user } = useAuth()
  const [currentFilter, setCurrentFilter] = useState<AudienceFilter>("all")
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [audience, setAudience] = useState<ManualAudience>("general")

  const canAddNotification = user?.role === "admin" || user?.role === "super_admin"

  useEffect(() => {
    const alreadyCleaned = localStorage.getItem(NOTIFICATIONS_CLEANUP_DONE_KEY)
    if (!alreadyCleaned) {
      storage.set(STORAGE_KEYS.NOTIFICATIONS, [])
      storage.set(ADMIN_NOTIFICATION_BOARD_KEY, [])
      localStorage.setItem(NOTIFICATIONS_CLEANUP_DONE_KEY, "true")
    }
    const stored = storage.get<AdminNotificationItem[]>(ADMIN_NOTIFICATION_BOARD_KEY)
    setNotifications(stored || [])
  }, [])

  const filteredNotifications = useMemo(() => {
    if (currentFilter === "all") return notifications
    return notifications.filter((item) => item.audience === currentFilter)
  }, [currentFilter, notifications])

  const closeModal = () => {
    setIsModalOpen(false)
    setTitle("")
    setDesc("")
    setAudience("general")
  }

  const pushToUsers = (notificationAudience: ManualAudience, notificationTitle: string, notificationDesc: string) => {
    const students = userStorage.getStudents().filter((s) => s.status === "approved")
    const teachers = userStorage.getTeachers().filter((t) => t.status === "active")
    const admins = userStorage.getAdmins().filter((a) => a.status === "active")

    const recipientIds = new Set<string>()

    if (notificationAudience === "general") {
      students.forEach((s) => recipientIds.add(s.id))
      teachers.forEach((t) => recipientIds.add(t.id))
      admins.forEach((a) => recipientIds.add(a.id))
    }

    if (notificationAudience === "teacher") {
      teachers.forEach((t) => recipientIds.add(t.id))
    }

    if (notificationAudience === "student") {
      students.forEach((s) => recipientIds.add(s.id))
    }
    Array.from(recipientIds).forEach((userId) => {
      messagingService.createNotification({
        userId,
        type: "info",
        title: notificationTitle,
        message: notificationDesc,
      })
    })
  }

  const handleAddNotification = () => {
    const safeTitle = title.trim()
    const safeDesc = desc.trim()
    if (!safeTitle || !safeDesc) return

    const newNotification: AdminNotificationItem = {
      id: `AN-${Date.now()}`,
      title: safeTitle,
      desc: safeDesc,
      audience,
      createdAt: new Date().toISOString(),
    }

    const updated = [newNotification, ...notifications]
    setNotifications(updated)
    storage.set(ADMIN_NOTIFICATION_BOARD_KEY, updated)
    pushToUsers(audience, safeTitle, safeDesc)
    closeModal()
  }

  return (
    <div className="space-y-5 py-2">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-medium">Notifications</h1>
        {canAddNotification && (
          <Button
            variant="outline"
            className="rounded-full text-xs sm:text-sm"
            onClick={() => setIsModalOpen(true)}
          >
            + Add notification
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCurrentFilter(tab.id)}
            className={`rounded-full border px-4 py-1.5 text-xs sm:text-sm transition-colors ${
              currentFilter === tab.id
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No notifications for this audience yet.
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const config = audienceConfig[item.audience]
            return (
              <Card key={item.id} className="border">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${config.iconClass}`}>
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${config.badgeClass}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                      {item.audience === "finance" && (item.financeCourseOrStrand || item.financeYear) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Target: {item.financeCourseOrStrand === "all" || !item.financeCourseOrStrand ? "All Courses/Strands" : item.financeCourseOrStrand}{" "}
                          / {item.financeYear === "all" || !item.financeYear ? "All Years" : `Year ${item.financeYear}`}
                        </p>
                      )}
                      <p className="mt-1.5 text-xs text-muted-foreground">{getTimeAgo(item.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <h2 className="text-base font-medium">New notification</h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Description</label>
                <Textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Write your message..."
                  rows={4}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Send to</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as ManualAudience)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="general">General (all)</option>
                  <option value="teacher">Teachers only</option>
                  <option value="student">Students only</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" className="rounded-full" onClick={closeModal}>
                Cancel
              </Button>
              <Button className="rounded-full" onClick={handleAddNotification}>
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
