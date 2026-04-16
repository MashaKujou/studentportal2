"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ACADEMIC_LEVELS, BACHELOR_YEARS, DIPLOMA_YEARS, SENIOR_HIGH_GRADES, SENIOR_HIGH_STRANDS } from "@/lib/constants"
import { collegeCoursesStorage, financialStorage, type FinancialFeeAssignment, type Student } from "@/lib/storage"

type AssignmentFormState = {
  title: string
  description: string
  academicLevel: "senior_high" | "diploma" | "bachelor"
  targetName: string
  gradeOrYear: string
  amount: string
  dueDate: string
}

type FeeSortOption = "newest" | "oldest" | "amount_high" | "amount_low" | "students_high" | "name"
type StudentSortOption = "name_asc" | "name_desc" | "email_asc" | "email_desc"

const INITIAL_FORM: AssignmentFormState = {
  title: "",
  description: "",
  academicLevel: ACADEMIC_LEVELS.SENIOR_HIGH,
  targetName: "",
  gradeOrYear: "",
  amount: "",
  dueDate: "",
}

const getAcademicLevelLabel = (academicLevel: FinancialFeeAssignment["academicLevel"]) => {
  if (academicLevel === ACADEMIC_LEVELS.SENIOR_HIGH) return "Senior High"
  if (academicLevel === ACADEMIC_LEVELS.DIPLOMA) return "Diploma"
  return "Bachelor"
}

const getGradeOrYearLabel = (academicLevel: FinancialFeeAssignment["academicLevel"]) => {
  return academicLevel === ACADEMIC_LEVELS.SENIOR_HIGH ? "Grade" : "Year"
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount)

const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString()

const getStudentDisplayName = (student: Student) => `${student.firstName} ${student.lastName}`.trim()

export const FinancialManagement = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<FeeSortOption>("newest")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<FinancialFeeAssignment | null>(null)
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const [studentSortBy, setStudentSortBy] = useState<StudentSortOption>("name_asc")
  const [formData, setFormData] = useState<AssignmentFormState>(INITIAL_FORM)

  const courseOptions = useMemo(() => collegeCoursesStorage.getAll(), [refreshKey])

  const targetOptions = useMemo(() => {
    if (formData.academicLevel === ACADEMIC_LEVELS.SENIOR_HIGH) {
      return [...SENIOR_HIGH_STRANDS]
    }

    if (formData.academicLevel === ACADEMIC_LEVELS.DIPLOMA) {
      return courseOptions.diplomaCourses
    }

    return courseOptions.bachelorCourses
  }, [courseOptions, formData.academicLevel])

  const gradeOrYearOptions = useMemo(() => {
    if (formData.academicLevel === ACADEMIC_LEVELS.SENIOR_HIGH) {
      return [...SENIOR_HIGH_GRADES]
    }

    if (formData.academicLevel === ACADEMIC_LEVELS.DIPLOMA) {
      return [...DIPLOMA_YEARS]
    }

    return [...BACHELOR_YEARS]
  }, [formData.academicLevel])

  const feeAssignments = useMemo(() => {
    const assignments = financialStorage.getAll().map((assignment) => ({
      ...assignment,
      studentCount: financialStorage.getStudentsForAssignment(assignment).length,
    }))

    const query = searchQuery.trim().toLowerCase()
    const filteredAssignments = query
      ? assignments.filter((assignment) => {
          const searchable = [
            assignment.title,
            assignment.description || "",
            assignment.targetName,
            assignment.gradeOrYear,
            getAcademicLevelLabel(assignment.academicLevel),
          ]

          return searchable.some((value) => value.toLowerCase().includes(query))
        })
      : assignments

    return filteredAssignments.sort((left, right) => {
      if (sortBy === "oldest") {
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      }

      if (sortBy === "amount_high") {
        return right.amount - left.amount
      }

      if (sortBy === "amount_low") {
        return left.amount - right.amount
      }

      if (sortBy === "students_high") {
        return right.studentCount - left.studentCount
      }

      if (sortBy === "name") {
        return left.title.localeCompare(right.title)
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    })
  }, [refreshKey, searchQuery, sortBy])

  const assignmentStudents = useMemo(() => {
    if (!selectedAssignment) {
      return []
    }

    const matchedStudents = financialStorage.getStudentsForAssignment(selectedAssignment)
    const query = studentSearchQuery.trim().toLowerCase()

    const filteredStudents = query
      ? matchedStudents.filter((student) => {
          const values = [getStudentDisplayName(student), student.email, student.studentId]
          return values.some((value) => value.toLowerCase().includes(query))
        })
      : matchedStudents

    return filteredStudents.sort((left, right) => {
      if (studentSortBy === "name_desc") {
        return getStudentDisplayName(right).localeCompare(getStudentDisplayName(left))
      }

      if (studentSortBy === "email_asc") {
        return left.email.localeCompare(right.email)
      }

      if (studentSortBy === "email_desc") {
        return right.email.localeCompare(left.email)
      }

      return getStudentDisplayName(left).localeCompare(getStudentDisplayName(right))
    })
  }, [selectedAssignment, studentSearchQuery, studentSortBy])

  const resetForm = () => {
    setFormData(INITIAL_FORM)
  }

  const handleAcademicLevelChange = (academicLevel: AssignmentFormState["academicLevel"]) => {
    setFormData((current) => ({
      ...current,
      academicLevel,
      targetName: "",
      gradeOrYear: "",
    }))
  }

  const handleCreateAssignment = () => {
    if (!formData.title.trim() || !formData.targetName || !formData.gradeOrYear || !formData.amount.trim()) {
      alert("Please complete the financial form.")
      return
    }

    const amount = Number(formData.amount)

    if (Number.isNaN(amount) || amount <= 0) {
      alert("Amount must be greater than zero.")
      return
    }

    financialStorage.add({
      title: formData.title.trim(),
      description: formData.description.trim(),
      academicLevel: formData.academicLevel,
      targetName: formData.targetName,
      targetType: formData.academicLevel === ACADEMIC_LEVELS.SENIOR_HIGH ? "strand" : "course",
      gradeOrYear: formData.gradeOrYear,
      amount,
      dueDate: formData.dueDate || undefined,
    })

    setRefreshKey((current) => current + 1)
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleDeleteAssignment = (assignmentId: string) => {
    if (!confirm("Delete this financial fee assignment?")) {
      return
    }

    financialStorage.delete(assignmentId)
    setRefreshKey((current) => current + 1)

    if (selectedAssignment?.id === assignmentId) {
      setSelectedAssignment(null)
      setStudentSearchQuery("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground">Create fees, assign them by academic group, and review the affected students.</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setIsCreateDialogOpen(true)
          }}
        >
          New Financial
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Section</CardTitle>
          <CardDescription>Search, sort, and review all assigned financial fees.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <Input
              placeholder="Search by fee, strand, course, grade, or year..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as FeeSortOption)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="amount_high">Sort: Amount High to Low</option>
              <option value="amount_low">Sort: Amount Low to High</option>
              <option value="students_high">Sort: Most Students</option>
              <option value="name">Sort: Name A-Z</option>
            </select>
          </div>

          {feeAssignments.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              No financial fees found for the current filters.
            </div>
          ) : (
            <div className="grid gap-4">
              {feeAssignments.map((assignment) => (
                <div key={assignment.id} className="rounded-lg border p-4 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">{assignment.title}</h2>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                          {getAcademicLevelLabel(assignment.academicLevel)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {assignment.targetType === "strand" ? "Strand" : "Course"}: {assignment.targetName} | {getGradeOrYearLabel(assignment.academicLevel)} {assignment.gradeOrYear}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Amount: {formatCurrency(assignment.amount)}
                        {assignment.dueDate ? ` | Due: ${formatDate(assignment.dueDate)}` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">{assignment.description || "No additional notes provided."}</p>
                    </div>

                    <div className="flex flex-col items-start gap-3 lg:items-end">
                      <div className="rounded-lg bg-muted px-4 py-3 text-sm">
                        <p className="font-semibold">Number of Students Enrolled</p>
                        <p className="text-2xl font-bold">{assignment.studentCount}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedAssignment(assignment)
                            setStudentSearchQuery("")
                            setStudentSortBy("name_asc")
                          }}
                        >
                          View Students
                        </Button>
                        <Button variant="destructive" onClick={() => handleDeleteAssignment(assignment.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Financial Fee</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Fee Title</label>
              <Input
                placeholder="Tuition Fee, Laboratory Fee, Miscellaneous Fee..."
                value={formData.title}
                onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Optional notes about this fee assignment"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Academic Level</label>
              <select
                value={formData.academicLevel}
                onChange={(event) => handleAcademicLevelChange(event.target.value as AssignmentFormState["academicLevel"])}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value={ACADEMIC_LEVELS.SENIOR_HIGH}>Senior High</option>
                <option value={ACADEMIC_LEVELS.DIPLOMA}>Diploma</option>
                <option value={ACADEMIC_LEVELS.BACHELOR}>Bachelor</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{formData.academicLevel === ACADEMIC_LEVELS.SENIOR_HIGH ? "Strand" : "Course"}</label>
              <select
                value={formData.targetName}
                onChange={(event) => setFormData((current) => ({ ...current, targetName: event.target.value }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select one</option>
                {targetOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{getGradeOrYearLabel(formData.academicLevel)}</label>
              <select
                value={formData.gradeOrYear}
                onChange={(event) => setFormData((current) => ({ ...current, gradeOrYear: event.target.value }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select one</option>
                {gradeOrYearOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(event) => setFormData((current) => ({ ...current, amount: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(event) => setFormData((current) => ({ ...current, dueDate: event.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAssignment}>Create Fee</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedAssignment} onOpenChange={(open) => !open && setSelectedAssignment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAssignment?.title} Students
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <Input
                placeholder="Search by student name, ID, or email..."
                value={studentSearchQuery}
                onChange={(event) => setStudentSearchQuery(event.target.value)}
              />
              <select
                value={studentSortBy}
                onChange={(event) => setStudentSortBy(event.target.value as StudentSortOption)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="name_asc">Sort: Name A-Z</option>
                <option value="name_desc">Sort: Name Z-A</option>
                <option value="email_asc">Sort: Email A-Z</option>
                <option value="email_desc">Sort: Email Z-A</option>
              </select>
            </div>

            <div className="text-sm text-muted-foreground">
              Total students: {assignmentStudents.length}
            </div>

            {assignmentStudents.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                No students matched this fee assignment.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[720px]">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left text-sm font-medium">Student Name</th>
                      <th className="p-3 text-left text-sm font-medium">Student ID</th>
                      <th className="p-3 text-left text-sm font-medium">Email</th>
                      <th className="p-3 text-left text-sm font-medium">Assignment Group</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentStudents.map((student) => (
                      <tr key={student.id} className="border-t">
                        <td className="p-3 text-sm font-medium">{getStudentDisplayName(student)}</td>
                        <td className="p-3 text-sm text-muted-foreground">{student.studentId}</td>
                        <td className="p-3 text-sm text-muted-foreground">{student.email}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {student.academicLevel === ACADEMIC_LEVELS.SENIOR_HIGH
                            ? `Grade ${student.grade} - ${student.strand}`
                            : `${student.course} Year ${student.year}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
