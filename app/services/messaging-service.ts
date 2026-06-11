import { STORAGE_KEYS } from "@/lib/constants"
import { storage } from "@/lib/storage"
import { generateId } from "@/lib/helpers"

export interface Message {
  id: string
  senderId: string
  receiverId: string
  subject: string
  content: string
  isRead: boolean
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  targetPath?: string
  isRead: boolean
  createdAt: string
}

export const messagingService = {
  // Message operations
  getMessages: (userId: string): Message[] => {
    const messages = storage.get<Message[]>(STORAGE_KEYS.MESSAGES) || []
    return messages.filter((m) => m.receiverId === userId || m.senderId === userId)
  },

  getInbox: (userId: string): Message[] => {
    const messages = messagingService.getMessages(userId)
    return messages.filter((m) => m.receiverId === userId)
  },

  getSent: (userId: string): Message[] => {
    const messages = messagingService.getMessages(userId)
    return messages.filter((m) => m.senderId === userId)
  },

  sendMessage: (message: Omit<Message, "id" | "createdAt" | "isRead">): Message => {
    const newMessage: Message = {
      ...message,
      id: generateId("MSG"),
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    const messages = storage.get<Message[]>(STORAGE_KEYS.MESSAGES) || []
    messages.push(newMessage)
    storage.set(STORAGE_KEYS.MESSAGES, messages)
    return newMessage
  },

  markAsRead: (messageId: string): void => {
    const messages = storage.get<Message[]>(STORAGE_KEYS.MESSAGES) || []
    const message = messages.find((m) => m.id === messageId)
    if (message) {
      message.isRead = true
      storage.set(STORAGE_KEYS.MESSAGES, messages)
    }
  },

  // Notification operations
  getNotifications: (userId: string): Notification[] => {
    const notifications = storage.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || []
    return notifications.filter((n) => n.userId === userId)
  },

  createNotification: (notification: Omit<Notification, "id" | "createdAt" | "isRead">): Notification => {
    const newNotification: Notification = {
      ...notification,
      id: generateId("NOT"),
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    const notifications = storage.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || []
    notifications.push(newNotification)
    storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications)
    return newNotification
  },

  markNotificationAsRead: (notificationId: string): void => {
    const notifications = storage.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || []
    const notification = notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.isRead = true
      storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications)
    }
  },
}
