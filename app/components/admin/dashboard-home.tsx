"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { userStorage, classStorage, subjectStorage } from "@/lib/storage"
import { useMemo } from "react"
import Link from "next/link"

export const AdminDashboardHome = () => {
  const stats = useMemo(() => {
    const students = userStorage.getStudents()
    const teachers = userStorage.getTeachers()
    const classes = classStorage.getAllClasses()
    const subjects = subjectStorage.getAllSubjects()

    return {
      totalStudents: students.length,
      approvedStudents: students.filter((s: any) => s.status === "approved").length,
      pendingStudents: students.filter((s: any) => s.status === "pending").length,
      totalTeachers: teachers.length,
      activeTeachers: teachers.filter((t: any) => t.status === "active").length,
      totalClasses: classes.length,
      totalSubjects: subjects.length,
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System administration and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.approvedStudents} approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.activeTeachers} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAdmins}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Link href="/admin/pending-registrations">
              <Button variant="outline" className="w-full bg-transparent">
                Pending Approvals
              </Button>
            </Link>
            <Link href="/admin/user-management">
              <Button variant="outline" className="w-full bg-transparent">
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/requests">
              <Button variant="outline" className="w-full bg-transparent">
                Process Requests
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full bg-transparent">
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
