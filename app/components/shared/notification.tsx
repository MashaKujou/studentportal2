"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

export interface NotificationProps {
  id: string
  type: "success" | "error" | "warning" | "info"
  message: string
  onClose: (id: string) => void
}

export const Notification: React.FC<NotificationProps> = ({ id, type, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(id), 300)
  }

  const bgColor = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  }[type]

  const textColor = {
    success: "text-green-900",
    error: "text-red-900",
    warning: "text-yellow-900",
    info: "text-blue-900",
  }[type]

  return (
    <div
      className={`${bgColor} ${textColor} border rounded-lg p-4 flex items-start justify-between transition-opacity ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <p className="text-sm">{message}</p>
      <button onClick={handleClose} className="ml-2 flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export const NotificationContainer: React.FC<{ notifications: NotificationProps[] }> = ({ notifications }) => {
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {notifications.map((notification) => (
        <Notification key={notification.id} {...notification} />
      ))}
    </div>
  )
}
