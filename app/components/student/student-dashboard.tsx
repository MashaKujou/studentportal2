"use client"

import type React from "react"

import { ProtectedRoute } from "@/app/components/shared/protected-route"
import { Navbar } from "@/app/components/shared/navbar"
import { Sidebar } from "@/app/components/shared/sidebar"
import { useAuth } from "@/app/contexts/auth-context"

interface StudentDashboardProps {
  children: React.ReactNode
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ children }) => {
  const { user } = useAuth()

  const sidebarItems = [
    { label: "Dashboard", href: "/student/dashboard" },
    { label: "My Classes", href: "/student/classes" },
    { label: "Grades", href: "/student/grades" },
    { label: "Attendance", href: "/student/attendance" },
    { label: "Schedule", href: "/student/schedule" },
    { label: "Documents", href: "/student/documents" },
    { label: "Requests", href: "/student/requests" },
    { label: "Financial", href: "/student/financial" },
    { label: "Library", href: "/student/library" },
    { label: "Notifications", href: "/student/notifications" },
    { label: "Feedback", href: "/student/feedback" },
    { label: "Contact Admin", href: "/student/contact-admin" },
  ]

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <Navbar title={`Welcome, ${user?.firstName}`} />
      <div className="flex min-h-screen bg-background">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
