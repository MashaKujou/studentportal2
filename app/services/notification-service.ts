import { STORAGE_KEYS } from "@/lib/constants"
import { storage } from "@/lib/storage"

export interface Notification {
  id: string
  userId: string
  type: "deadline" | "schedule_change" | "payment_due" | "grade_posted" | "registration_open" | "event" | "system" | "other"
  title: string
  message: string
  status: "unread" | "read" | "archived"
  createdAt: string
  actionUrl?: string
  relatedId?: string
}

export const notificationService = {
  getNotifications: (userId: string): Notification[] => {
    const notifications = storage.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || []
    return notifications.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getUnreadCount: (userId: string): number => {
    const notifications = storage.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || []
    return notifications.filter((n) => n.userId === userId && n.status === "unread").length
  },

  createNotification: (notification: Omit<Notification, "id" | "createdAt">): Notification => {
    const notifications = storage.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || []
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }
    notifications.push(newNotification)
    storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications)
    return newNotification
  },

  markAsRead: (notificationId: string): void => {
    const notifications = storage.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || []
    const notification = notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.status = "read"
      storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications)
    }
  },

  markAsArchived: (notificationId: string): void => {
    const notifications = storage.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || []
    const notification = notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.status = "archived"
      storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications)
    }
  },

  deleteNotification: (notificationId: string): void => {
    const notifications = storage.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || []
    const filtered = notifications.filter((n) => n.id !== notificationId)
    storage.set(STORAGE_KEYS.NOTIFICATIONS, filtered)
  },

  sendBulkNotification: (userIds: string[], notification: Omit<Notification, "id" | "createdAt" | "userId">): void => {
    const notifications = storage.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || []
    userIds.forEach((userId) => {
      const newNotification: Notification = {
        ...notification,
        userId,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      }
      notifications.push(newNotification)
    })
    storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications)
  },

  clearArchived: (userId: string): void => {
    const notifications = storage.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || []
    const filtered = notifications.filter((n) => !(n.userId === userId && n.status === "archived"))
    storage.set(STORAGE_KEYS.NOTIFICATIONS, filtered)
  },
}
