"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/contexts/auth-context"
import { teacherService } from "@/app/services/teacher-service"
import { useMemo } from "react"
import Link from "next/link"

export const TeacherMyClasses = () => {
  const { user } = useAuth()

  const classes = useMemo(() => {
    if (!user) return []
    const allClasses = teacherService.getMyClasses(user.id)
    return allClasses.map((cls) => ({
      id: cls.id,
      name: `${cls.subjectCode} - ${cls.subjectName}`,
      grade: `${cls.courseOrStrand} • Year ${cls.yearOrGrade}`,
      studentCount: cls.students.length,
      subject: cls.subjectName,
    }))
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Classes</h1>
        <p className="text-muted-foreground">Classes you're teaching</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Classes</CardTitle>
          <CardDescription>Your assigned classes</CardDescription>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No classes assigned yet</p>
          ) : (
            <div className="space-y-2">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{cls.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {cls.grade} · {cls.studentCount} students
                    </p>
                  </div>
                  <Link href={`/teacher/classes/${encodeURIComponent(cls.id)}`}>
                    <Button size="sm">View Details</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
