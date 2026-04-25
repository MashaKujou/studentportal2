"use client"

import type React from "react"

import { ProtectedRoute } from "@/app/components/shared/protected-route"
import { Navbar } from "@/app/components/shared/navbar"
import { BottomNav } from "@/app/components/shared/bottom-nav"
import { useAuth } from "@/app/contexts/auth-context"
import { getNavbarTitle } from "@/lib/constants"
import {
  LayoutDashboard,
  BookOpen,
  PenTool,
  BarChart3,
} from "lucide-react"

interface TeacherDashboardProps {
  children: React.ReactNode
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ children }) => {
  const { user } = useAuth()

  const navItems = [
    { label: "Dashboard", href: "/teacher/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Classes", href: "/teacher/classes", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Grades", href: "/teacher/grade-input", icon: <PenTool className="w-5 h-5" /> },
    { label: "Analytics", href: "/teacher/analytics", icon: <BarChart3 className="w-5 h-5" /> },
  ]

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <Navbar title={getNavbarTitle(user)} />
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
        <BottomNav items={navItems} />
      </div>
    </ProtectedRoute>
  )
}
