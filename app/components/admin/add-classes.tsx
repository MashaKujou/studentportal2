"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { courseSubjectsStorage, userStorage, subjectStorage } from "@/lib/storage"
import { useMemo, useState } from "react"
import { ACADEMIC_LEVELS, SENIOR_HIGH_GRADES, DIPLOMA_YEARS, BACHELOR_YEARS, SENIOR_HIGH_STRANDS } from "@/lib/constants"
import { collegeCoursesStorage } from "@/lib/storage"

export const AddClasses = () => {
  const [newCode, setNewCode] = useState("")
  const [newName, setNewName] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  const [selectedClassStudents, setSelectedClassStudents] = useState<any[]>([])
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [selectedClassName, setSelectedClassName] = useState("")

  // Wizard: Add Class -> Create Subject -> Assign to Course/Year
  const [isAddClassWizardOpen, setIsAddClassWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState<1 | 2>(1)
  const [wizardAcademicLevel, setWizardAcademicLevel] = useState<"" | "senior_high" | "diploma" | "bachelor">("")
  const [wizardCourse, setWizardCourse] = useState("")
  const [wizardYear, setWizardYear] = useState("")
  const [wizardTeacherId, setWizardTeacherId] = useState("")
  const [wizardCreatedSubject, setWizardCreatedSubject] = useState<any>(null)
  const [wizardSelectedDays, setWizardSelectedDays] = useState<string[]>([])
  const [wizardTimeStart, setWizardTimeStart] = useState("07:00")
  const [wizardTimeEnd, setWizardTimeEnd] = useState("08:00")
  const [wizardStep1Errors, setWizardStep1Errors] = useState<Record<string, string>>({})
  const [wizardStep2Errors, setWizardStep2Errors] = useState<Record<string, string>>({})

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSortYear, setSelectedSortYear] = useState("")
  const [selectedSortCourse, setSelectedSortCourse] = useState("")

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [editAcademicLevel, setEditAcademicLevel] = useState<"" | "senior_high" | "diploma" | "bachelor">("")
  const [editCourse, setEditCourse] = useState("")
  const [editYear, setEditYear] = useState("")
  const [editTeacherId, setEditTeacherId] = useState("")
  const [editCode, setEditCode] = useState("")
  const [editName, setEditName] = useState("")
  const [editTimeStart, setEditTimeStart] = useState("07:00")
  const [editTimeEnd, setEditTimeEnd] = useState("08:00")
  const [editDays, setEditDays] = useState<string[]>([])
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  const allStudents = useMemo(() => userStorage.getStudents(), [refreshKey])

  const getBucketStudentCount = (academicLevel: string, courseOrStrand: string, yearOrGrade: string) => {
    if (!academicLevel || !courseOrStrand || !yearOrGrade) return 0
    if (academicLevel === ACADEMIC_LEVELS.SENIOR_HIGH) {
      return allStudents.filter(
        (s: any) =>
          s.academicLevel === ACADEMIC_LEVELS.SENIOR_HIGH &&
          s.strand === courseOrStrand &&
          s.grade === yearOrGrade &&
          s.status === "approved",
      ).length
    }
    if (academicLevel === ACADEMIC_LEVELS.DIPLOMA) {
      return allStudents.filter(
        (s: any) =>
          s.academicLevel === ACADEMIC_LEVELS.DIPLOMA &&
          s.course === courseOrStrand &&
          s.year === yearOrGrade &&
          s.status === "approved",
      ).length
    }
    if (academicLevel === ACADEMIC_LEVELS.BACHELOR) {
      return allStudents.filter(
        (s: any) =>
          s.academicLevel === ACADEMIC_LEVELS.BACHELOR &&
          s.course === courseOrStrand &&
          s.year === yearOrGrade &&
          s.status === "approved",
      ).length
    }
    return 0
  }

  const timeOptions = useMemo(() => {
    const options: string[] = []
    for (let h = 7; h <= 20; h++) {
      const hh = String(h).padStart(2, "0")
      options.push(`${hh}:00`)
    }
    return options
  }, [])

  const wizardCourses = useMemo(() => {
    if (wizardAcademicLevel === ACADEMIC_LEVELS.SENIOR_HIGH) return SENIOR_HIGH_STRANDS
    if (wizardAcademicLevel === ACADEMIC_LEVELS.DIPLOMA) return collegeCoursesStorage.getAll().diplomaCourses
    if (wizardAcademicLevel === ACADEMIC_LEVELS.BACHELOR) return collegeCoursesStorage.getAll().bachelorCourses
    return []
  }, [wizardAcademicLevel])

  const editCourses = useMemo(() => {
    if (editAcademicLevel === ACADEMIC_LEVELS.SENIOR_HIGH) return SENIOR_HIGH_STRANDS
    if (editAcademicLevel === ACADEMIC_LEVELS.DIPLOMA) return collegeCoursesStorage.getAll().diplomaCourses
    if (editAcademicLevel === ACADEMIC_LEVELS.BACHELOR) return collegeCoursesStorage.getAll().bachelorCourses
    return []
  }, [editAcademicLevel])

  const wizardYears = useMemo(() => {
    if (wizardAcademicLevel === ACADEMIC_LEVELS.SENIOR_HIGH) return SENIOR_HIGH_GRADES
    if (wizardAcademicLevel === ACADEMIC_LEVELS.DIPLOMA) return DIPLOMA_YEARS
    if (wizardAcademicLevel === ACADEMIC_LEVELS.BACHELOR) return BACHELOR_YEARS
    return []
  }, [wizardAcademicLevel])

  const editYears = useMemo(() => {
    if (editAcademicLevel === ACADEMIC_LEVELS.SENIOR_HIGH) return SENIOR_HIGH_GRADES
    if (editAcademicLevel === ACADEMIC_LEVELS.DIPLOMA) return DIPLOMA_YEARS
    if (editAcademicLevel === ACADEMIC_LEVELS.BACHELOR) return BACHELOR_YEARS
    return []
  }, [editAcademicLevel])

  const wizardAssignedSubjects = useMemo(() => {
    if (!wizardAcademicLevel || !wizardCourse || !wizardYear) return []
    const bucket = courseSubjectsStorage.getBucket(wizardAcademicLevel as any, wizardCourse, wizardYear)
    const subjects = subjectStorage.getAll()
    const teachers = userStorage.getTeachers()
    const byId = new Map(subjects.map((s) => [s.id, s]))
    const teacherById = new Map(teachers.map((t) => [t.id, `${t.firstName} ${t.lastName}`.trim()]))

    const assignments =
      bucket?.subjectAssignments ||
      (bucket?.subjectIds || []).map((id) => ({ subjectId: id, teacherId: "" }))

    return assignments
      .map((a) => {
        const subject = byId.get(a.subjectId)
        if (!subject) return null
        return {
          ...subject,
          assignedTeacherId: a.teacherId,
          assignedTeacherName: a.teacherId ? teacherById.get(a.teacherId) || "Unknown Teacher" : "Unassigned",
        }
      })
      .filter(Boolean)
  }, [wizardAcademicLevel, wizardCourse, wizardYear, refreshKey])

  const handleWizardCreateSubject = () => {
    const errors: Record<string, string> = {}
    if (!newCode.trim()) errors.newCode = "Subject Code is required."
    if (!newName.trim()) errors.newName = "Subject Name is required."
    if (!wizardAcademicLevel) errors.wizardAcademicLevel = "Academic Level is required."
    if (!wizardTimeStart) errors.wizardTimeStart = "Start Time is required."
    if (!wizardTimeEnd) errors.wizardTimeEnd = "End Time is required."
    if (wizardTimeStart >= wizardTimeEnd) errors.timeRange = "End Time must be later than Start Time."
    if (wizardSelectedDays.length === 0) errors.wizardSelectedDays = "Select at least one day."
    if (Object.keys(errors).length > 0) {
      setWizardStep1Errors(errors)
      return
    }
    setWizardStep1Errors({})

    const unitLabel =
      wizardAcademicLevel === ACADEMIC_LEVELS.SENIOR_HIGH
        ? "Senior High"
        : wizardAcademicLevel === ACADEMIC_LEVELS.DIPLOMA
          ? "Diploma"
          : "Bachelor"

    const timeLabel = `${wizardTimeStart} - ${wizardTimeEnd}`
    const dayLabel = wizardSelectedDays.join(", ")

    const created = subjectStorage.add({
      code: newCode.toUpperCase(),
      name: newName,
      time: timeLabel,
      day: dayLabel,
      unit: unitLabel,
    })
    setWizardCreatedSubject(created)
    setNewCode("")
    setNewName("")
    setWizardSelectedDays([])
    setWizardTimeStart("07:00")
    setWizardTimeEnd("08:00")
    setWizardStep(2)
    setRefreshKey((k) => k + 1)
  }

  const handleWizardAssignSubject = () => {
    const errors: Record<string, string> = {}
    if (!wizardAcademicLevel) errors.wizardAcademicLevel = "Academic Level is required."
    if (!wizardCourse) errors.wizardCourse = "Course/Strand is required."
    if (!wizardYear) errors.wizardYear = "Year/Grade is required."
    if (!wizardTeacherId) errors.wizardTeacherId = "Teacher is required."
    if (!wizardCreatedSubject) errors.wizardCreatedSubject = "Create subject first."
    if (Object.keys(errors).length > 0) {
      setWizardStep2Errors(errors)
      return
    }
    setWizardStep2Errors({})
    courseSubjectsStorage.addSubjectToBucket(
      wizardAcademicLevel as any,
      wizardCourse,
      wizardYear,
      wizardCreatedSubject.id,
      wizardTeacherId,
    )
    setIsAddClassWizardOpen(false)
    setWizardStep(1)
    setWizardCreatedSubject(null)
    setWizardTeacherId("")
    setRefreshKey((k) => k + 1)
  }

  const handleOpenWizard = () => {
    setIsAddClassWizardOpen(true)
    setWizardStep(1)
    setWizardCreatedSubject(null)
    setWizardAcademicLevel("")
    setWizardCourse("")
    setWizardYear("")
    setWizardTeacherId("")
    setWizardSelectedDays([])
    setWizardTimeStart("07:00")
    setWizardTimeEnd("08:00")
  }

  const teachers = useMemo(() => {
    return userStorage.getTeachers()
  }, [refreshKey])

  const allClassRows = useMemo(() => {
    const buckets = courseSubjectsStorage.getAll()
    const subjects = subjectStorage.getAll()
    const subjectById = new Map(subjects.map((s) => [s.id, s]))
    const teacherById = new Map(teachers.map((t) => [t.id, `${t.firstName} ${t.lastName}`.trim()]))

    const rows: any[] = []
    buckets.forEach((bucket) => {
      const assignments = bucket.subjectAssignments || bucket.subjectIds.map((id) => ({ subjectId: id, teacherId: "" }))
      assignments.forEach((assignment) => {
        const subject = subjectById.get(assignment.subjectId)
        if (!subject) return
        rows.push({
          id: `${bucket.id}:${subject.id}`,
          bucketId: bucket.id,
          subjectId: subject.id,
          subjectCode: subject.code,
          subjectName: subject.name,
          day: subject.day,
          time: subject.time,
          teacherId: assignment.teacherId,
          teacherName: assignment.teacherId ? teacherById.get(assignment.teacherId) || "Unknown Teacher" : "Unassigned",
          academicLevel: bucket.academicLevel,
          courseOrStrand: bucket.courseOrStrand,
          yearOrGrade: bucket.yearOrGrade,
          students: getBucketStudentCount(bucket.academicLevel, bucket.courseOrStrand, bucket.yearOrGrade),
        })
      })
    })

    return rows
  }, [refreshKey, teachers])

  const sortYearOptions = useMemo(() => {
    return Array.from(new Set(allClassRows.map((r) => String(r.yearOrGrade)))).sort((a, b) => a.localeCompare(b))
  }, [allClassRows])

  const sortCourseOptions = useMemo(() => {
    const configured = [
      ...SENIOR_HIGH_STRANDS,
      ...collegeCoursesStorage.getAll().diplomaCourses,
      ...collegeCoursesStorage.getAll().bachelorCourses,
    ]
    return Array.from(new Set(configured.map((v) => String(v)))).sort((a, b) => a.localeCompare(b))
  }, [refreshKey])

  const classes = useMemo(() => {
    const filtered = allClassRows.filter((r) => {
      const q = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !q ||
        r.subjectCode.toLowerCase().includes(q) ||
        r.subjectName.toLowerCase().includes(q) ||
        r.courseOrStrand.toLowerCase().includes(q) ||
        String(r.yearOrGrade).toLowerCase().includes(q) ||
        r.teacherName.toLowerCase().includes(q)
      const matchesYear = !selectedSortYear || String(r.yearOrGrade) === selectedSortYear
      const matchesCourse = !selectedSortCourse || String(r.courseOrStrand) === selectedSortCourse
      return matchesSearch && matchesYear && matchesCourse
    })

    filtered.sort(
      (a, b) =>
        a.courseOrStrand.localeCompare(b.courseOrStrand) || String(a.yearOrGrade).localeCompare(String(b.yearOrGrade)),
    )

    return filtered
  }, [allClassRows, searchTerm, selectedSortYear, selectedSortCourse])

  // Attendance removed.
  const openEditModal = (item: any) => {
    const [timeStart, timeEnd] = (item.time || "07:00 - 08:00").split(" - ")
    const days = (item.day || "").split(",").map((d: string) => d.trim()).filter(Boolean)

    setEditingItem(item)
    setEditAcademicLevel(item.academicLevel)
    setEditCourse(item.courseOrStrand)
    setEditYear(item.yearOrGrade)
    setEditTeacherId(item.teacherId || "")
    setEditCode(item.subjectCode || "")
    setEditName(item.subjectName || "")
    setEditTimeStart(timeStart || "07:00")
    setEditTimeEnd(timeEnd || "08:00")
    setEditDays(days)
    setEditErrors({})
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingItem) return
    const errors: Record<string, string> = {}
    if (!editAcademicLevel) errors.editAcademicLevel = "Academic Level is required."
    if (!editCourse) errors.editCourse = "Course/Strand is required."
    if (!editYear) errors.editYear = "Year/Grade is required."
    if (!editTeacherId) errors.editTeacherId = "Teacher is required."
    if (!editCode.trim()) errors.editCode = "Subject Code is required."
    if (!editName.trim()) errors.editName = "Subject Name is required."
    if (!editTimeStart || !editTimeEnd || editTimeStart >= editTimeEnd) errors.editTime = "Valid time range is required."
    if (editDays.length === 0) errors.editDays = "Select at least one day."
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }

    subjectStorage.update(editingItem.subjectId, {
      code: editCode.toUpperCase(),
      name: editName,
      day: editDays.join(", "),
      time: `${editTimeStart} - ${editTimeEnd}`,
    })

    courseSubjectsStorage.moveOrUpdateSubjectAssignment({
      oldAcademicLevel: editingItem.academicLevel,
      oldCourseOrStrand: editingItem.courseOrStrand,
      oldYearOrGrade: editingItem.yearOrGrade,
      newAcademicLevel: editAcademicLevel as any,
      newCourseOrStrand: editCourse,
      newYearOrGrade: editYear,
      subjectId: editingItem.subjectId,
      teacherId: editTeacherId,
    })

    setIsEditOpen(false)
    setEditingItem(null)
    setRefreshKey((k) => k + 1)
  }

  const handleViewStudents = (classData: any) => {
    const allStudents = userStorage.getStudents()
    const enrolledStudents = allStudents
      .filter((s) => {
        if (classData.academicLevel === ACADEMIC_LEVELS.SENIOR_HIGH) {
          return (
            s.status === "approved" &&
            s.academicLevel === ACADEMIC_LEVELS.SENIOR_HIGH &&
            s.strand === classData.courseOrStrand &&
            s.grade === classData.yearOrGrade
          )
        }
        return (
          s.status === "approved" &&
          s.academicLevel === classData.academicLevel &&
          s.course === classData.courseOrStrand &&
          s.year === classData.yearOrGrade
        )
      })
      .sort((a: any, b: any) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
        return nameA.localeCompare(nameB)
      })
    
    setSelectedClassStudents(enrolledStudents)
    setSelectedClassName(`${classData.subjectCode} - ${classData.subjectName}`)
    setIsStudentModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Classes & Subjects</h1>
        <p className="text-muted-foreground">Manage subjects and create class sections</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div />
        <Button onClick={handleOpenWizard} className="h-10 px-5 font-semibold">
          Add Subject to Course & Year
        </Button>
      </div>

      <Tabs defaultValue="view-classes">
        <TabsList>
          <TabsTrigger value="view-classes">View Classes</TabsTrigger>
        </TabsList>

        <TabsContent value="view-classes">
          <Card>
            <CardHeader>
              <CardTitle>All Classes</CardTitle>
              <CardDescription>Assigned subjects by course/strand and year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 items-end">
                <Input
                  placeholder="Search subject, teacher, course/strand, year..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9"
                />
                <Input
                  list="year-filter-options"
                  placeholder="Choose Year"
                  value={selectedSortYear}
                  onChange={(e) => setSelectedSortYear(e.target.value)}
                  className="h-9"
                />
                <datalist id="year-filter-options">
                  {sortYearOptions.map((year) => (
                    <option key={year} value={year} />
                  ))}
                </datalist>
                <Input
                  list="course-filter-options"
                  placeholder="Choose Course or Strand"
                  value={selectedSortCourse}
                  onChange={(e) => setSelectedSortCourse(e.target.value)}
                  className="h-9"
                />
                <datalist id="course-filter-options">
                  {sortCourseOptions.map((course) => (
                    <option key={course} value={course} />
                  ))}
                </datalist>
              </div>
              {classes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No classes created yet</p>
              ) : (
                <div className="space-y-2">
                  {classes.map((cls) => {
                    const studentCount = cls.students
                    
                    return (
                      <div key={cls.id} className="p-4 border rounded-lg hover:bg-muted">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">
                              {cls.subjectCode} - {cls.subjectName}
                            </p>
                            <p className="text-sm text-muted-foreground">Teacher: {cls.teacherName}</p>
                            <p className="text-xs text-muted-foreground">
                              {cls.academicLevel} • {cls.courseOrStrand} • {cls.yearOrGrade} • {cls.day} at {cls.time}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-sm font-medium text-blue-600">
                                {studentCount === 0 
                                  ? 'No Students' 
                                  : `${studentCount} ${studentCount === 1 ? 'Student' : 'Students'} Found`
                                }
                              </p>
                              <Button 
                                onClick={() => handleViewStudents(cls)}
                                disabled={studentCount === 0}
                                className="h-8 px-3 text-xs font-medium bg-accent/10 hover:bg-accent/20 text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                View Students
                              </Button>
                              <Button
                                onClick={() => openEditModal(cls)}
                                className="h-8 px-3 text-xs font-medium"
                                variant="outline"
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      <Dialog open={isStudentModalOpen} onOpenChange={setIsStudentModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Students Enrolled in {selectedClassName}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedClassStudents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No students enrolled yet</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Total: {selectedClassStudents.length} {selectedClassStudents.length === 1 ? 'student' : 'students'}
                </p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">#</th>
                        <th className="text-left p-3 font-medium">Student Name</th>
                        <th className="text-left p-3 font-medium">Email</th>
                        <th className="text-left p-3 font-medium">Course/Strand</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedClassStudents.map((student: any, idx: number) => (
                        <tr key={student.id} className="border-t hover:bg-muted/50">
                          <td className="p-3 text-muted-foreground">{idx + 1}</td>
                          <td className="p-3 font-medium">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">{student.email}</td>
                          <td className="p-3 text-sm">
                            {student.academicLevel === ACADEMIC_LEVELS.SENIOR_HIGH 
                              ? student.strand 
                              : student.course}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Class Wizard Modal */}
      <Dialog open={isAddClassWizardOpen} onOpenChange={setIsAddClassWizardOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Class</DialogTitle>
          </DialogHeader>

          {wizardStep === 1 && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-sm font-semibold">Subject Form</p>
                <p className="text-xs text-muted-foreground">Fill up subject info then create.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Subject Code</label>
                  <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="e.g. CS101" />
                  {wizardStep1Errors.newCode && <p className="text-xs text-red-600">{wizardStep1Errors.newCode}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Academic Level</label>
                  <select
                    value={wizardAcademicLevel}
                    onChange={(e) => setWizardAcademicLevel(e.target.value as any)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select...</option>
                    <option value={ACADEMIC_LEVELS.SENIOR_HIGH}>Senior High</option>
                    <option value={ACADEMIC_LEVELS.DIPLOMA}>Diploma</option>
                    <option value={ACADEMIC_LEVELS.BACHELOR}>Bachelor</option>
                  </select>
                  {wizardStep1Errors.wizardAcademicLevel && <p className="text-xs text-red-600">{wizardStep1Errors.wizardAcademicLevel}</p>}
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium">Subject Name</label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Subject name" />
                  {wizardStep1Errors.newName && <p className="text-xs text-red-600">{wizardStep1Errors.newName}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Time (Start)</label>
                  <select
                    value={wizardTimeStart}
                    onChange={(e) => setWizardTimeStart(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {wizardStep1Errors.wizardTimeStart && <p className="text-xs text-red-600">{wizardStep1Errors.wizardTimeStart}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Time (End)</label>
                  <select
                    value={wizardTimeEnd}
                    onChange={(e) => setWizardTimeEnd(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {wizardStep1Errors.wizardTimeEnd && <p className="text-xs text-red-600">{wizardStep1Errors.wizardTimeEnd}</p>}
                </div>
                {wizardStep1Errors.timeRange && <p className="text-xs text-red-600 md:col-span-2">{wizardStep1Errors.timeRange}</p>}

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Day (click to select)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
                      const checked = wizardSelectedDays.includes(day)
                      return (
                        <label key={day} className="flex items-center gap-2 text-sm border rounded px-3 py-2 bg-background">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) setWizardSelectedDays((prev) => [...prev, day])
                              else setWizardSelectedDays((prev) => prev.filter((d) => d !== day))
                            }}
                          />
                          {day}
                        </label>
                      )
                    })}
                  </div>
                </div>
                {wizardStep1Errors.wizardSelectedDays && <p className="text-xs text-red-600">{wizardStep1Errors.wizardSelectedDays}</p>}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setIsAddClassWizardOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleWizardCreateSubject}
                  disabled={!newCode || !newName || !wizardAcademicLevel || wizardSelectedDays.length === 0}
                >
                  Create Subject
                </Button>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-sm font-semibold">Assign Subject to Course & Year</p>
                <p className="text-xs text-muted-foreground">
                  Subject created: <span className="font-semibold">{wizardCreatedSubject?.code}</span> —{" "}
                  {wizardCreatedSubject?.name}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Academic Level</label>
                  <select
                    value={wizardAcademicLevel}
                    onChange={(e) => {
                      setWizardAcademicLevel(e.target.value as any)
                      setWizardCourse("")
                      setWizardYear("")
                    }}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select...</option>
                    <option value={ACADEMIC_LEVELS.SENIOR_HIGH}>Senior High</option>
                    <option value={ACADEMIC_LEVELS.DIPLOMA}>Diploma</option>
                    <option value={ACADEMIC_LEVELS.BACHELOR}>Bachelor</option>
                  </select>
                  {wizardStep2Errors.wizardAcademicLevel && <p className="text-xs text-red-600">{wizardStep2Errors.wizardAcademicLevel}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    {wizardAcademicLevel === ACADEMIC_LEVELS.SENIOR_HIGH ? "Strand" : "Course"}
                  </label>
                  <select
                    value={wizardCourse}
                    onChange={(e) => setWizardCourse(e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={!wizardAcademicLevel}
                  >
                    <option value="">Select...</option>
                    {wizardCourses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {wizardStep2Errors.wizardCourse && <p className="text-xs text-red-600">{wizardStep2Errors.wizardCourse}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    {wizardAcademicLevel === ACADEMIC_LEVELS.SENIOR_HIGH ? "Grade" : "Year"}
                  </label>
                  <select
                    value={wizardYear}
                    onChange={(e) => setWizardYear(e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={!wizardAcademicLevel || !wizardCourse}
                  >
                    <option value="">Select...</option>
                    {wizardYears.map((y) => {
                      const count = getBucketStudentCount(wizardAcademicLevel, wizardCourse, String(y))
                      return (
                        <option key={y} value={y}>
                          {y} ({count} Students)
                        </option>
                      )
                    })}
                  </select>
                  {wizardStep2Errors.wizardYear && <p className="text-xs text-red-600">{wizardStep2Errors.wizardYear}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Teacher</label>
                  <select
                    value={wizardTeacherId}
                    onChange={(e) => setWizardTeacherId(e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={!wizardAcademicLevel || !wizardCourse || !wizardYear}
                  >
                    <option value="">Select...</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}
                      </option>
                    ))}
                  </select>
                  {wizardStep2Errors.wizardTeacherId && <p className="text-xs text-red-600">{wizardStep2Errors.wizardTeacherId}</p>}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setWizardStep(1)
                    setWizardCreatedSubject(null)
                  }}
                >
                  Back
                </Button>
                <Button
                  onClick={handleWizardAssignSubject}
                  disabled={!wizardAcademicLevel || !wizardCourse || !wizardYear || !wizardTeacherId || !wizardCreatedSubject}
                >
                  Add Subject to Course & Year
                </Button>
              </div>

              {wizardAcademicLevel && wizardCourse && wizardYear && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Subjects for selection</CardTitle>
                    <CardDescription>
                      {wizardAcademicLevel} • {wizardCourse} • {wizardYear}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {wizardAssignedSubjects.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No subjects assigned yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {wizardAssignedSubjects.map((s: any) => (
                          <div key={s.id} className="p-3 border rounded flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{s.code}</p>
                              <p className="text-xs text-muted-foreground">{s.name}</p>
                              <p className="text-xs text-muted-foreground">Teacher: {s.assignedTeacherName}</p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {s.day} • {s.time}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Class Assignment</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Subject Code</label>
              <Input value={editCode} onChange={(e) => setEditCode(e.target.value)} />
              {editErrors.editCode && <p className="text-xs text-red-600">{editErrors.editCode}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Subject Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              {editErrors.editName && <p className="text-xs text-red-600">{editErrors.editName}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Academic Level</label>
              <select
                value={editAcademicLevel}
                onChange={(e) => {
                  setEditAcademicLevel(e.target.value as any)
                  setEditCourse("")
                  setEditYear("")
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">Select...</option>
                <option value={ACADEMIC_LEVELS.SENIOR_HIGH}>Senior High</option>
                <option value={ACADEMIC_LEVELS.DIPLOMA}>Diploma</option>
                <option value={ACADEMIC_LEVELS.BACHELOR}>Bachelor</option>
              </select>
              {editErrors.editAcademicLevel && <p className="text-xs text-red-600">{editErrors.editAcademicLevel}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">{editAcademicLevel === ACADEMIC_LEVELS.SENIOR_HIGH ? "Strand" : "Course"}</label>
              <select value={editCourse} onChange={(e) => setEditCourse(e.target.value)} className="w-full p-2 border rounded">
                <option value="">Select...</option>
                {editCourses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {editErrors.editCourse && <p className="text-xs text-red-600">{editErrors.editCourse}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">{editAcademicLevel === ACADEMIC_LEVELS.SENIOR_HIGH ? "Grade" : "Year"}</label>
              <select value={editYear} onChange={(e) => setEditYear(e.target.value)} className="w-full p-2 border rounded">
                <option value="">Select...</option>
                {editYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              {editErrors.editYear && <p className="text-xs text-red-600">{editErrors.editYear}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Teacher</label>
              <select value={editTeacherId} onChange={(e) => setEditTeacherId(e.target.value)} className="w-full p-2 border rounded">
                <option value="">Select...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                ))}
              </select>
              {editErrors.editTeacherId && <p className="text-xs text-red-600">{editErrors.editTeacherId}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Start Time</label>
              <select value={editTimeStart} onChange={(e) => setEditTimeStart(e.target.value)} className="w-full p-2 border rounded">
                {timeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">End Time</label>
              <select value={editTimeEnd} onChange={(e) => setEditTimeEnd(e.target.value)} className="w-full p-2 border rounded">
                {timeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {editErrors.editTime && <p className="text-xs text-red-600">{editErrors.editTime}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Days</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                  <label key={day} className="flex items-center gap-2 text-sm border rounded px-3 py-2 bg-background">
                    <input
                      type="checkbox"
                      checked={editDays.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) setEditDays((prev) => [...prev, day])
                        else setEditDays((prev) => prev.filter((d) => d !== day))
                      }}
                    />
                    {day}
                  </label>
                ))}
              </div>
              {editErrors.editDays && <p className="text-xs text-red-600">{editErrors.editDays}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
