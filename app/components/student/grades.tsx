"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/app/contexts/auth-context"
import { studentService } from "@/app/services/student-service"
import { useMemo } from "react"
import { calculateGPA, getGradeFromScore } from "@/lib/helpers"

export const StudentGrades = () => {
  const { user } = useAuth()

  const gradesData = useMemo(() => {
    if (!user) return { grades: [], gpa: 0, average: 0 }
    const grades = studentService.getGrades(user.id)
    const scores = grades.map((g) => g.score)
    const gpa = calculateGPA(scores)
    const average = scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0

    return {
      grades: grades.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      gpa,
      average,
    }
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Grades</h1>
        <p className="text-muted-foreground">Your academic performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradesData.gpa.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradesData.average.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradesData.grades.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grade Records</CardTitle>
          <CardDescription>Your complete grade history</CardDescription>
        </CardHeader>
        <CardContent>
          {gradesData.grades.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No grades recorded yet</p>
          ) : (
            <div className="space-y-2">
              {gradesData.grades.map((grade) => (
                <div
                  key={grade.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted"
                >
                  <div>
                    <p className="font-semibold">{grade.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {grade.term} - {grade.semester}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{grade.score}</div>
                    <div className="text-sm text-muted-foreground">Grade: {getGradeFromScore(grade.score)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
