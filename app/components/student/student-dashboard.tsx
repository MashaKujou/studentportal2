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
  BarChart3,
  Calendar,
  FileText,
  HelpCircle,
  DollarSign,
  Library,
  Bell,
  MessageSquare,
  MessageCircle,
} from "lucide-react"

interface StudentDashboardProps {
  children: React.ReactNode
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ children }) => {
  const { user } = useAuth()

  const navItems = [
    { label: "Dashboard", href: "/student/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Classes", href: "/student/classes", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Grades", href: "/student/grades", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "Schedule", href: "/student/schedule", icon: <Calendar className="w-5 h-5" /> },
    { label: "Documents", href: "/student/documents", icon: <FileText className="w-5 h-5" /> },
    { label: "Requests", href: "/student/requests", icon: <HelpCircle className="w-5 h-5" /> },
    { label: "Financial", href: "/student/financial", icon: <DollarSign className="w-5 h-5" /> },
    { label: "Library", href: "/student/library", icon: <Library className="w-5 h-5" /> },
    { label: "Notifications", href: "/student/notifications", icon: <Bell className="w-5 h-5" /> },
    { label: "Feedback", href: "/student/feedback", icon: <MessageSquare className="w-5 h-5" /> },
    { label: "Contact Admin", href: "/student/contact-admin", icon: <MessageCircle className="w-5 h-5" /> },
  ]

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <Navbar title={getNavbarTitle(user)} />
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
        <BottomNav items={navItems} />
      </div>
    </ProtectedRoute>
  )
}
