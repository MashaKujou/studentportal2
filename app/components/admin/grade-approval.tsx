"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { gradesStorage, userStorage, type Grade } from "@/lib/storage"
import { useAuth } from "@/app/contexts/auth-context"
import { Check, X } from "lucide-react"

export const GradeApproval = () => {
  const { user } = useAuth()
  const [pendingGrades, setPendingGrades] = useState<Grade[]>([])
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [filterSemester, setFilterSemester] = useState<string>("all")
  const [filterTerm, setFilterTerm] = useState<string>("all")

  useEffect(() => {
    loadPendingGrades()
  }, [filterSemester, filterTerm])

  const loadPendingGrades = () => {
    let grades = gradesStorage.getPendingApproval()

    if (filterSemester !== "all") {
      grades = grades.filter((g) => g.semester === filterSemester)
    }

    if (filterTerm !== "all") {
      grades = grades.filter((g) => g.term === filterTerm)
    }

    setPendingGrades(grades)
  }

  const handleApprove = (gradeId: string) => {
    gradesStorage.update(gradeId, {
      status: "approved",
      approvedAt: new Date().toISOString(),
      approvedBy: user?.id,
    })
    loadPendingGrades()
    setSelectedGrade(null)
    alert("Grade approved successfully!")
  }

  const handleReject = (gradeId: string) => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection")
      return
    }

    gradesStorage.update(gradeId, {
      status: "rejected",
      rejectedReason: rejectReason,
      approvedAt: new Date().toISOString(),
      approvedBy: user?.id,
    })
    loadPendingGrades()
    setSelectedGrade(null)
    setRejectReason("")
    alert("Grade rejected")
  }

  const getStudentName = (studentId: string) => {
    const student = userStorage.getStudents().find((s) => s.id === studentId)
    return student ? `${student.firstName} ${student.lastName}` : "Unknown Student"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Grade Approval</h1>
        <p className="text-muted-foreground">Review and approve submitted grades</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Semester</label>
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="all">All Semesters</option>
            <option value="1st Semester">1st Semester</option>
            <option value="2nd Semester">2nd Semester</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Filter by Term</label>
          <select
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="all">All Terms</option>
            <option value="Prelim">Prelim</option>
            <option value="Midterm">Midterm</option>
            <option value="PreFinals">PreFinals</option>
            <option value="Finals">Finals</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Grade Approvals ({pendingGrades.length})</CardTitle>
          <CardDescription>Review grades submitted by teachers</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingGrades.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No pending grade approvals</p>
          ) : (
            <div className="space-y-4">
              {pendingGrades.map((grade) => (
                <div key={grade.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-semibold">
                        {grade.subjectCode} - {grade.subjectName}
                      </h3>
                      <p className="text-sm text-muted-foreground">Student: {getStudentName(grade.studentId)}</p>
                      <p className="text-sm text-muted-foreground">Teacher: {grade.teacherName}</p>
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline">{grade.semester}</Badge>
                        <Badge variant="outline">{grade.term}</Badge>
                        <span className="text-lg font-bold">Score: {grade.score}</span>
                      </div>
                      {grade.submittedAt && (
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(grade.submittedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedGrade?.id === grade.id ? (
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex gap-3 items-start">
                        <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Reason for Rejection (optional)</label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          rows={2}
                          placeholder="Provide feedback if rejecting..."
                        />
                        </div>
                        <div className="flex flex-col gap-2 pt-6">
                          <Button
                            onClick={() => handleApprove(grade.id)}
                            className="h-9 w-9 p-0 bg-green-600 hover:bg-green-700 text-white"
                            title="Approve"
                            aria-label="Approve"
                          >
                            <Check className="h-5 w-5" />
                          </Button>
                          <Button
                            onClick={() => handleReject(grade.id)}
                            className="h-9 w-9 p-0 bg-red-600 hover:bg-red-700 text-white"
                            title="Reject"
                            aria-label="Reject"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={() => setSelectedGrade(null)} 
                          className="h-10 px-6 font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setSelectedGrade(grade)} 
                      className="w-full mt-2 h-10 font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-colors"
                    >
                      Review Grade
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
