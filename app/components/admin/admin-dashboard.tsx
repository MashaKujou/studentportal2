"use client"

import type React from "react"

import { ProtectedRoute } from "@/app/components/shared/protected-route"
import { Navbar } from "@/app/components/shared/navbar"
import { Sidebar } from "@/app/components/shared/sidebar"
import { useAuth } from "@/app/contexts/auth-context"

interface AdminDashboardProps {
  children: React.ReactNode
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ children }) => {
  const { user } = useAuth()

  const sidebarItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Pending Registrations", href: "/admin/pending-registrations" },
    { label: "User Management", href: "/admin/user-management" },
    { label: "Classes & Subjects", href: "/admin/classes" },
    { label: "Grade Approval", href: "/admin/grade-approval" },
    { label: "Request Management", href: "/admin/requests" },
    { label: "Student Messages", href: "/admin/messages" },
    { label: "Analytics", href: "/admin/analytics" },
    { label: "Settings", href: "/admin/settings" },
  ]

  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <Navbar title={`Admin - ${user?.firstName}`} />
      <div className="flex min-h-screen bg-background">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
