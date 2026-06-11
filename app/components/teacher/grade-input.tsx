"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/app/contexts/auth-context"
import { useState, useEffect } from "react"
import { gradesStorage } from "@/lib/storage"
import { teacherService } from "@/app/services/teacher-service"

const COLLEGE_GRADE_EQUIVALENTS = [
  { label: "1.0", min: 98, max: 100, suggestedScore: 98 },
  { label: "1.25", min: 95, max: 97, suggestedScore: 95 },
  { label: "1.50", min: 92, max: 94, suggestedScore: 92 },
  { label: "1.75", min: 89, max: 91, suggestedScore: 89 },
  { label: "2.00", min: 86, max: 88, suggestedScore: 86 },
  { label: "2.25", min: 83, max: 85, suggestedScore: 83 },
  { label: "2.50", min: 80, max: 82, suggestedScore: 80 },
  { label: "2.75", min: 77, max: 79, suggestedScore: 77 },
  { label: "3.00", min: 75, max: 76, suggestedScore: 75 },
  { label: "5.00", min: 0, max: 74, suggestedScore: 74 },
] as const

const COLLEGE_SPECIAL_MARKS = ["NYC", "DRP"] as const

export const TeacherGradeInput = () => {
  const { user } = useAuth()
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSemester, setSelectedSemester] = useState<"1st Semester" | "2nd Semester">("1st Semester")
  const [selectedTerm, setSelectedTerm] = useState<"Prelim" | "Midterm" | "PreFinals" | "Finals">("Prelim")
  const [studentGrades, setStudentGrades] = useState<Record<string, number>>({})
  const [studentSpecialMarks, setStudentSpecialMarks] = useState<Record<string, "NYC" | "DRP">>({})
  const [students, setStudents] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const selectedClassData = classes.find((c) => c.id === selectedClass)
  const isCollegeClass = selectedClassData?.academicLevel === "diploma" || selectedClassData?.academicLevel === "bachelor"

  useEffect(() => {
    if (user) {
      const teacherClasses = teacherService.getMyClasses(user.id)
      setClasses(teacherClasses)
    }
  }, [user])

  useEffect(() => {
    if (selectedClass) {
      const classData = classes.find((c) => c.id === selectedClass)
      if (classData) {
        const enrolledStudents = teacherService.getClassStudents(selectedClass)
        setStudents(enrolledStudents)

        const existingGrades = gradesStorage.getByClassId(selectedClass).filter(
          (g) => g.semester === selectedSemester && g.term === selectedTerm,
        )

        const gradesMap: Record<string, number> = {}
        existingGrades.forEach((grade) => {
          gradesMap[grade.studentId] = grade.score
        })
        setStudentGrades(gradesMap)
        setStudentSpecialMarks({})
      }
    }
  }, [selectedClass, selectedSemester, selectedTerm, classes])

  const handleGradeChange = (studentId: string, score: string) => {
    const normalizedValue = score.trim().toUpperCase()
    if (isCollegeClass && (normalizedValue === "NYC" || normalizedValue === "DRP")) {
      setStudentSpecialMarks((prev) => ({ ...prev, [studentId]: normalizedValue }))
      setStudentGrades((prev) => {
        const newGrades = { ...prev }
        delete newGrades[studentId]
        return newGrades
      })
      return
    }

    const numScore = parseFloat(score)
    if (!isNaN(numScore) && numScore >= 0 && numScore <= 100) {
      setStudentGrades((prev) => ({ ...prev, [studentId]: numScore }))
      setStudentSpecialMarks((prev) => {
        const next = { ...prev }
        delete next[studentId]
        return next
      })
    } else if (score === "") {
      setStudentGrades((prev) => {
        const newGrades = { ...prev }
        delete newGrades[studentId]
        return newGrades
      })
      setStudentSpecialMarks((prev) => {
        const next = { ...prev }
        delete next[studentId]
        return next
      })
    }
  }

  const convertToCollegeEquivalent = (score?: number) => {
    if (score === undefined || Number.isNaN(score)) return "-"
    const match = COLLEGE_GRADE_EQUIVALENTS.find((range) => score >= range.min && score <= range.max)
    return match ? match.label : "-"
  }

  const handleCollegeChipDrop = (studentId: string, chipValue: string) => {
    if (chipValue === "NYC" || chipValue === "DRP") {
      setStudentSpecialMarks((prev) => ({ ...prev, [studentId]: chipValue }))
      setStudentGrades((prev) => {
        const next = { ...prev }
        delete next[studentId]
        return next
      })
      return
    }

    const selectedRange = COLLEGE_GRADE_EQUIVALENTS.find((item) => item.label === chipValue)
    if (!selectedRange) return
    setStudentGrades((prev) => ({ ...prev, [studentId]: selectedRange.suggestedScore }))
    setStudentSpecialMarks((prev) => {
      const next = { ...prev }
      delete next[studentId]
      return next
    })
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
                    {cls.subjectCode} - {cls.subjectName} ({cls.courseOrStrand} Y{cls.yearOrGrade})
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
              {isCollegeClass && (
                <div className="space-y-2 rounded-md border p-3 bg-muted/20">
                  <p className="text-sm font-medium">College quick chips (drag to grade field)</p>
                  <div className="flex flex-wrap gap-2">
                    {COLLEGE_GRADE_EQUIVALENTS.map((item) => (
                      <Badge
                        key={item.label}
                        variant="secondary"
                        className="cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={(event) => event.dataTransfer.setData("text/plain", item.label)}
                        title={`${item.min}-${item.max}`}
                      >
                        {item.label}
                      </Badge>
                    ))}
                    {COLLEGE_SPECIAL_MARKS.map((mark) => (
                      <Badge
                        key={mark}
                        variant="outline"
                        className="cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={(event) => event.dataTransfer.setData("text/plain", mark)}
                      >
                        {mark}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    NYC = Not Yet Completed, DRP = Drop. Numeric score still submitted for approval.
                  </p>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Student ID</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Grade</th>
                      {isCollegeClass && <th className="text-left p-2">College Eq.</th>}
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
                          <div
                            onDragOver={(event) => {
                              if (isCollegeClass) event.preventDefault()
                            }}
                            onDrop={(event) => {
                              if (!isCollegeClass) return
                              event.preventDefault()
                              handleCollegeChipDrop(student.id, event.dataTransfer.getData("text/plain"))
                            }}
                          >
                            <Input
                              type={isCollegeClass ? "text" : "number"}
                              placeholder={isCollegeClass ? "0-100 / NYC / DRP" : "0-100"}
                              min={isCollegeClass ? undefined : "0"}
                              max={isCollegeClass ? undefined : "100"}
                              step={isCollegeClass ? undefined : "0.01"}
                              value={studentSpecialMarks[student.id] || studentGrades[student.id] || ""}
                              onChange={(e) => handleGradeChange(student.id, e.target.value)}
                              className="w-32"
                            />
                          </div>
                        </td>
                        {isCollegeClass && (
                          <td className="p-2">
                            {studentSpecialMarks[student.id] ? (
                              <Badge variant="outline">{studentSpecialMarks[student.id]}</Badge>
                            ) : (
                              <span className="font-medium">{convertToCollegeEquivalent(studentGrades[student.id])}</span>
                            )}
                          </td>
                        )}
                        <td className="p-2 font-semibold">{calculateAverage(student.id)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button 
                onClick={handleSubmitGrades} 
                disabled={isSubmitting} 
                className="w-full h-11 font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
