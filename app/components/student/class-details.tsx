"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/contexts/auth-context"
import { classesStorage, userStorage } from "@/lib/storage"
import { useMemo } from "react"
import Link from "next/link"

interface StudentClassDetailsProps {
  classId: string
}

export const StudentClassDetails = ({ classId }: StudentClassDetailsProps) => {
  const { user } = useAuth()

  const classData = useMemo(() => {
    if (!user || !classId) return null
    const allClasses = classesStorage.getAll()
    const cls = allClasses.find((c) => c.id === classId)
    if (!cls || !cls.students.includes(user.id)) return null

    // Get teacher details
    const teachers = userStorage.getTeachers()
    const teacher = teachers.find((t) => t.id === cls.teacherId)

    // Get all students in the class
    const students = userStorage.getStudents()
    const classStudents = students.filter((s) => cls.students.includes(s.id))

    return {
      ...cls,
      teacher,
      classStudents,
    }
  }, [user, classId])

  if (!classData) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Class Details</h1>
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">Class not found or you are not enrolled</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/student/classes">
          <Button variant="outline" size="sm">
            ← Back to Classes
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mt-4">{classData.subjectName}</h1>
        <p className="text-muted-foreground">{classData.subjectCode}</p>
      </div>

      {/* Class Information */}
      <Card>
        <CardHeader>
          <CardTitle>Class Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Subject Code</p>
              <p className="font-semibold">{classData.subjectCode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subject Name</p>
              <p className="font-semibold">{classData.subjectName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Schedule</p>
              <p className="font-semibold">
                {classData.day} at {classData.time}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Term</p>
              <p className="font-semibold">
                Semester {classData.semester}, Year {classData.year}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructor Information */}
      <Card>
        <CardHeader>
          <CardTitle>Instructor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 border border-border rounded-lg">
            <p className="font-medium">
              {classData.teacher?.firstName} {classData.teacher?.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{classData.teacher?.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Class Students */}
      <Card>
        <CardHeader>
          <CardTitle>Classmates</CardTitle>
          <CardDescription>{classData.classStudents.length} students enrolled</CardDescription>
        </CardHeader>
        <CardContent>
          {classData.classStudents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No other students in this class</p>
          ) : (
            <div className="space-y-2">
              {classData.classStudents.map((student) => (
                <div key={student.id} className="p-3 border border-border rounded-lg">
                  <p className="font-medium">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
