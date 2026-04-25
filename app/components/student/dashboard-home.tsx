"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/app/contexts/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { studentService } from "@/app/services/student-service"
import { useMemo } from "react"
 

export const StudentDashboardHome = () => {
  const { user } = useAuth()
  const academicGroup = useMemo(() => {
    if (!user) return { gradeLabel: "-", sectionLabel: "-" }
    const isSeniorHigh = (user as any).academicLevel === "senior_high"
    const courseOrStrand = isSeniorHigh ? (user as any).strand : (user as any).course
    const yearOrGrade = isSeniorHigh ? (user as any).grade : (user as any).year
    return {
      gradeLabel: courseOrStrand || "-",
      sectionLabel: yearOrGrade || "-",
    }
  }, [user])

  const stats = useMemo(() => {
    if (!user) return { grades: 0, requests: 0 }
    const grades = studentService.getGrades(user.id)
    const requests = studentService.getRequests(user.id)

    return {
      grades: grades.length,
      requests: requests.filter((r) => r.status === "pending").length,
    }
  }, [user])

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user.firstName} {user.middleName ? `${user.middleName} ` : ""}{user.lastName}</h1>
        <p className="text-muted-foreground mt-2">
          {academicGroup.gradeLabel} - {academicGroup.sectionLabel}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.grades}</div>
            <p className="text-xs text-muted-foreground mt-1">Total grades entered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.requests}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Access commonly used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Link href="/student/grades">
              <Button variant="outline" className="w-full bg-transparent">
                View Grades
              </Button>
            </Link>
            <Link href="/student/schedule">
              <Button variant="outline" className="w-full bg-transparent">
                View Schedule
              </Button>
            </Link>
            <Link href="/student/requests">
              <Button variant="outline" className="w-full bg-transparent">
                Make Request
              </Button>
            </Link>
            <Link href="/student/settings">
              <Button variant="outline" className="w-full bg-transparent">
                Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
