"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/app/contexts/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { teacherService } from "@/app/services/teacher-service"
import { useMemo } from "react"

export const TeacherDashboardHome = () => {
  const { user } = useAuth()

  const stats = useMemo(() => {
    if (!user) return { classes: 0, students: 0, gradesToday: 0 }
    const classes = teacherService.getMyClasses(user.id)
    const totalStudents = classes.reduce((acc, c) => acc + c.students.length, 0)
    const analytics = teacherService.getTeacherAnalytics(user.id)

    return {
      classes: classes.length,
      students: totalStudents,
      gradesToday: analytics.gradesEntered,
    }
  }, [user])

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user.firstName}</h1>
        <p className="text-muted-foreground mt-2">{(user as any).department}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/teacher/classes" className="block">
        <Card className="cursor-pointer hover:bg-muted/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.classes}</div>
            <p className="text-xs text-muted-foreground mt-1">Teaching</p>
          </CardContent>
        </Card>
        </Link>

        <Link href="/teacher/classes" className="block">
        <Card className="cursor-pointer hover:bg-muted/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all classes</p>
          </CardContent>
        </Card>
        </Link>

        <Link href="/teacher/grade-input" className="block">
        <Card className="cursor-pointer hover:bg-muted/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Grades Entered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.gradesToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Total grades</p>
          </CardContent>
        </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Link href="/teacher/classes">
              <Button variant="outline" className="w-full bg-transparent">
                View Classes
              </Button>
            </Link>
            <Link href="/teacher/grade-input">
              <Button variant="outline" className="w-full bg-transparent">
                Enter Grades
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
