"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/contexts/auth-context"
import { classesStorage } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Class {
  id: string
  subjectId: string
  subjectCode: string
  subjectName: string
  teacherId: string
  teacherName: string
  time: string
  day: string
  semester: string
  year: string
  students: string[]
  createdAt: string
}

export const MyClasses: React.FC = () => {
  const { user } = useAuth()
  const [enrolledClasses, setEnrolledClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    // Get all classes and filter for the ones the student is enrolled in
    const allClasses = classesStorage.getAll()
    const studentClasses = allClasses.filter((cls) => cls.students.includes(user.id))
    setEnrolledClasses(studentClasses)
    setLoading(false)
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading your classes...</div>
      </div>
    )
  }

  if (enrolledClasses.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">My Classes</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">You are not enrolled in any classes yet.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">My Classes</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {enrolledClasses.map((cls) => (
          <Card key={cls.id}>
            <CardHeader>
              <CardTitle className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{cls.subjectCode}</p>
                  <p>{cls.subjectName}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Instructor</p>
                <p>{cls.teacherName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Day</p>
                  <p>{cls.day}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Time</p>
                  <p>{cls.time}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Semester</p>
                  <p>{cls.semester}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Year</p>
                  <p>{cls.year}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students Enrolled</p>
                <p>{cls.students.length}</p>
              </div>
              <Link href={`/student/classes/${cls.id}`}>
                <Button className="w-full mt-2">View Class Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
