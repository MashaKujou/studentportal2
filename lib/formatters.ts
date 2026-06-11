// Data formatting utilities

import { formatDistanceToNow, format } from "date-fns"

export const formatDate = (date: Date | string, formatStr = "MMM dd, yyyy"): string => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return format(dateObj, formatStr)
  } catch {
    return "Invalid date"
  }
}

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, "MMM dd, yyyy HH:mm")
}

export const formatRelativeTime = (date: Date | string): string => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true })
  } catch {
    return "Unknown time"
  }
}

export const formatGPA = (gpa: number): string => {
  return gpa.toFixed(2)
}

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`
}

export const formatAttendancePercentage = (present: number, total: number): string => {
  if (total === 0) return "0%"
  return formatPercentage(present / total)
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const formatFileSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

export const truncateText = (text: string, maxLength = 100): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}

export const formatName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim()
}

export const initials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}
