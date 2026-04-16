"use client"

import type React from "react"

import { ProtectedRoute } from "@/app/components/shared/protected-route"
import { Navbar } from "@/app/components/shared/navbar"
import { BottomNav } from "@/app/components/shared/bottom-nav"
import { useAuth } from "@/app/contexts/auth-context"
import { getNavbarTitle } from "@/lib/constants"
import {
  LayoutDashboard,
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  MessageCircle,
  BarChart3,
  Settings,
  DollarSign,
} from "lucide-react"

interface AdminDashboardProps {
  children: React.ReactNode
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ children }) => {
  const { user } = useAuth()

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Pending", href: "/admin/pending-registrations", icon: <Clock className="w-5 h-5" /> },
    { label: "Users", href: "/admin/user-management", icon: <Users className="w-5 h-5" /> },
    { label: "Classes", href: "/admin/classes", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Grades", href: "/admin/grade-approval", icon: <CheckCircle className="w-5 h-5" /> },
    { label: "Financial", href: "/admin/financial", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Requests", href: "/admin/requests", icon: <MessageCircle className="w-5 h-5" /> },
    { label: "Messages", href: "/admin/messages", icon: <MessageCircle className="w-5 h-5" /> },
    { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
  ]

  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <Navbar title={getNavbarTitle(user)} />
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
        <BottomNav items={navItems} />
      </div>
    </ProtectedRoute>
  )
}
