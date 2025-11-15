"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/app/contexts/auth-context"
import { useState, useEffect } from "react"
import { classesStorage, userStorage, gradesStorage, type Grade } from "@/lib/storage"

export const TeacherGradeInput = () => {
  const { user } = useAuth()
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSemester, setSelectedSemester] = useState<"1st Semester" | "2nd Semester">("1st Semester")
  const [selectedTerm, setSelectedTerm] = useState<"Prelim" | "Midterm" | "PreFinals" | "Finals">("Prelim")
  const [studentGrades, setStudentGrades] = useState<Record<string, number>>({})
  const [students, setStudents] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      const teacherClasses = classesStorage.getByTeacherId(user.id)
      setClasses(teacherClasses)
    }
  }, [user])

  useEffect(() => {
    if (selectedClass) {
      const classData = classes.find((c) => c.id === selectedClass)
      if (classData) {
        const allStudents = userStorage.getStudents()
        const enrolledStudents = allStudents.filter((s) => classData.students.includes(s.id))
        setStudents(enrolledStudents)

        const existingGrades = gradesStorage.getByClassId(selectedClass).filter(
          (g) => g.semester === selectedSemester && g.term === selectedTerm,
        )

        const gradesMap: Record<string, number> = {}
        existingGrades.forEach((grade) => {
          gradesMap[grade.studentId] = grade.score
        })
        setStudentGrades(gradesMap)
      }
    }
  }, [selectedClass, selectedSemester, selectedTerm, classes])

  const handleGradeChange = (studentId: string, score: string) => {
    const numScore = parseFloat(score)
    if (!isNaN(numScore) && numScore >= 0 && numScore <= 100) {
      setStudentGrades((prev) => ({ ...prev, [studentId]: numScore }))
    } else if (score === "") {
      setStudentGrades((prev) => {
        const newGrades = { ...prev }
        delete newGrades[studentId]
        return newGrades
      })
    }
  }

  const calculateAverage = (studentId: string) => {
    const studentClassGrades = gradesStorage
      .getByClassId(selectedClass)
      .filter((g) => g.studentId === studentId && g.semester === selectedSemester)

    if (studentClassGrades.length === 0) return 0

    const total = studentClassGrades.reduce((sum, grade) => sum + grade.score, 0)
    return (total / studentClassGrades.length).toFixed(2)
  }

  const handleSubmitGrades = async () => {
    if (!selectedClass || !user) return

    const classData = classes.find((c) => c.id === selectedClass)
    if (!classData) return

    setIsSubmitting(true)
    try {
      Object.entries(studentGrades).forEach(([studentId, score]) => {
        const existingGrade = gradesStorage
          .getAll()
          .find(
            (g) =>
              g.studentId === studentId &&
              g.classId === selectedClass &&
              g.semester === selectedSemester &&
              g.term === selectedTerm,
          )

        if (existingGrade) {
          gradesStorage.update(existingGrade.id, {
            score,
            status: "submitted",
            submittedAt: new Date().toISOString(),
          })
        } else {
          gradesStorage.add({
            studentId,
            classId: selectedClass,
            subjectCode: classData.subjectCode,
            subjectName: classData.subjectName,
            teacherId: user.id,
            teacherName: `${user.firstName} ${user.lastName}`,
            semester: selectedSemester,
            term: selectedTerm,
            score,
            status: "submitted",
            submittedAt: new Date().toISOString(),
          })
        }
      })

      alert("Grades submitted successfully for admin approval!")
      setStudentGrades({})
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Grade Input</h1>
        <p className="text-muted-foreground">Enter and manage student grades</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Grades</CardTitle>
          <CardDescription>Input grades for your students by semester and term</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="class" className="block text-sm font-medium mb-2">
                Select Class
              </label>
              <select
                id="class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Choose a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.subjectCode} - {cls.subjectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="semester" className="block text-sm font-medium mb-2">
                Semester
              </label>
              <select
                id="semester"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value as any)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
              </select>
            </div>

            <div>
              <label htmlFor="term" className="block text-sm font-medium mb-2">
                Term
              </label>
              <select
                id="term"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value as any)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="Prelim">Prelim</option>
                <option value="Midterm">Midterm</option>
                <option value="PreFinals">PreFinals</option>
                <option value="Finals">Finals</option>
              </select>
            </div>
          </div>

          {selectedClass && students.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Enter Student Grades (0-100)</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Student ID</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Grade</th>
                      <th className="text-left p-2">Semester Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">{student.studentId}</td>
                        <td className="p-2">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            placeholder="0-100"
                            min="0"
                            max="100"
                            step="0.01"
                            value={studentGrades[student.id] || ""}
                            onChange={(e) => handleGradeChange(student.id, e.target.value)}
                            className="w-24"
                          />
                        </td>
                        <td className="p-2 font-semibold">{calculateAverage(student.id)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button onClick={handleSubmitGrades} disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Submitting..." : "Submit Grades for Admin Approval"}
              </Button>
            </div>
          )}

          {selectedClass && students.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No students enrolled in this class</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
