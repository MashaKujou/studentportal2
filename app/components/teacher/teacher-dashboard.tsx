"use client"

import type React from "react"

import { ProtectedRoute } from "@/app/components/shared/protected-route"
import { Navbar } from "@/app/components/shared/navbar"
import { Sidebar } from "@/app/components/shared/sidebar"
import { useAuth } from "@/app/contexts/auth-context"

interface TeacherDashboardProps {
  children: React.ReactNode
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ children }) => {
  const { user } = useAuth()

  const sidebarItems = [
    { label: "Dashboard", href: "/teacher/dashboard" },
    { label: "My Classes", href: "/teacher/classes" },
    { label: "Grade Input", href: "/teacher/grade-input" },
    { label: "Attendance", href: "/teacher/attendance-marking" },
    { label: "Materials", href: "/teacher/materials" },
    { label: "Analytics", href: "/teacher/analytics" },
  ]

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <Navbar title={`Teacher - ${user?.firstName}`} />
      <div className="flex min-h-screen bg-background">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
