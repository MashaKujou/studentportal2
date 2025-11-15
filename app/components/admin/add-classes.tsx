"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { adminService } from "@/app/services/admin-service"
import { userStorage, subjectStorage } from "@/lib/storage"
import { useMemo, useState } from "react"
import {
  ACADEMIC_LEVELS,
  SENIOR_HIGH_GRADES,
  DIPLOMA_YEARS,
  BACHELOR_YEARS,
  SENIOR_HIGH_STRANDS,
} from "@/lib/constants"
import { collegeCoursesStorage } from "@/lib/storage"

export const AddClasses = () => {
  const [subjectCode, setSubjectCode] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<any>(null)
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [semester, setSemester] = useState("1")
  const [year, setYear] = useState("1")
  const [newCode, setNewCode] = useState("")
  const [newName, setNewName] = useState("")
  const [newTime, setNewTime] = useState("")
  const [newDay, setNewDay] = useState("")
  const [newUnit, setNewUnit] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  const [bulkAcademicLevel, setBulkAcademicLevel] = useState("")
  const [bulkCourse, setBulkCourse] = useState("")
  const [bulkYear, setBulkYear] = useState("")
  const [bulkClassId, setBulkClassId] = useState("")
  const [bulkEnrollMessage, setBulkEnrollMessage] = useState("")

  const [attendanceSearchId, setAttendanceSearchId] = useState("")
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [attendanceSearched, setAttendanceSearched] = useState(false)

  const [selectedClassStudents, setSelectedClassStudents] = useState<any[]>([])
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [selectedClassName, setSelectedClassName] = useState("")

  const [isBulkStudentModalOpen, setIsBulkStudentModalOpen] = useState(false)

  const subjects = useMemo(() => {
    return subjectStorage.getAll()
  }, [refreshKey])

  const teachers = useMemo(() => {
    return userStorage.getTeachers()
  }, [])

  const classes = useMemo(() => {
    return adminService.getAllClasses()
  }, [refreshKey])

  const availableCourses = useMemo(() => {
    if (bulkAcademicLevel === ACADEMIC_LEVELS.SENIOR_HIGH) {
      return SENIOR_HIGH_STRANDS
    } else if (bulkAcademicLevel === ACADEMIC_LEVELS.DIPLOMA) {
      return collegeCoursesStorage.getAll().diplomaCourses
    } else if (bulkAcademicLevel === ACADEMIC_LEVELS.BACHELOR) {
      return collegeCoursesStorage.getAll().bachelorCourses
    }
    return []
  }, [bulkAcademicLevel])

  const availableYears = useMemo(() => {
    if (bulkAcademicLevel === ACADEMIC_LEVELS.SENIOR_HIGH) {
      return SENIOR_HIGH_GRADES
    } else if (bulkAcademicLevel === ACADEMIC_LEVELS.DIPLOMA) {
      return DIPLOMA_YEARS
    } else if (bulkAcademicLevel === ACADEMIC_LEVELS.BACHELOR) {
      return BACHELOR_YEARS
    }
    return []
  }, [bulkAcademicLevel])

  const matchingStudents = useMemo(() => {
    if (!bulkAcademicLevel || !bulkCourse || !bulkYear) return []

    const allStudents = userStorage.getStudents()

    if (bulkAcademicLevel === ACADEMIC_LEVELS.SENIOR_HIGH) {
      return allStudents.filter(
        (s) =>
          s.academicLevel === ACADEMIC_LEVELS.SENIOR_HIGH &&
          s.strand === bulkCourse &&
          s.grade === bulkYear &&
          s.status === "approved",
      )
    } else if (bulkAcademicLevel === ACADEMIC_LEVELS.DIPLOMA) {
      return allStudents.filter(
        (s) =>
          s.academicLevel === ACADEMIC_LEVELS.DIPLOMA &&
          s.course === bulkCourse &&
          s.year === bulkYear &&
          s.status === "approved",
      )
    } else if (bulkAcademicLevel === ACADEMIC_LEVELS.BACHELOR) {
      return allStudents.filter(
        (s) =>
          s.academicLevel === ACADEMIC_LEVELS.BACHELOR &&
          s.course === bulkCourse &&
          s.year === bulkYear &&
          s.status === "approved",
      )
    }
    return []
  }, [bulkAcademicLevel, bulkCourse, bulkYear])

  const handleSearchSubject = () => {
    const found = subjectStorage.getByCode(subjectCode)
    setSelectedSubject(found || null)
  }

  const handleAddClass = () => {
    if (selectedSubject && selectedTeacher) {
      adminService.addClass(selectedSubject.code, selectedTeacher, semester, year)
      setSelectedSubject(null)
      setSelectedTeacher("")
      setSemester("1")
      setYear("1")
      setSubjectCode("")
      setRefreshKey((k) => k + 1)
    }
  }

  const handleCreateSubject = () => {
    if (newCode && newName && newTime && newDay && newUnit) {
      adminService.createSubject(newCode, newName, newTime, newDay, newUnit)
      setNewCode("")
      setNewName("")
      setNewTime("")
      setNewDay("")
      setNewUnit("")
      setRefreshKey((k) => k + 1)
    }
  }

  const handleDeleteSubject = (id: string) => {
    adminService.deleteSubject(id)
    setRefreshKey((k) => k + 1)
  }

  const handleBulkEnroll = () => {
    if (!bulkAcademicLevel || !bulkCourse || !bulkYear || !bulkClassId) {
      setBulkEnrollMessage("Please fill in all fields")
      return
    }

    adminService.bulkEnrollStudents(
      bulkClassId,
      matchingStudents.map((s) => s.id),
    )
    setBulkEnrollMessage(`Successfully enrolled ${matchingStudents.length} students`)

    setTimeout(() => {
      setBulkEnrollMessage("")
      setBulkAcademicLevel("")
      setBulkCourse("")
      setBulkYear("")
      setBulkClassId("")
      setRefreshKey((k) => k + 1)
    }, 2000)
  }

  const handleSearchAttendance = () => {
    const allAttendance = JSON.parse(localStorage.getItem("attendance") || "[]")
    const filtered = attendanceSearchId
      ? allAttendance.filter((att: any) => 
          att.id.toLowerCase().includes(attendanceSearchId.toLowerCase()) ||
          att.classId.toLowerCase().includes(attendanceSearchId.toLowerCase())
        )
      : allAttendance
    
    setAttendanceRecords(filtered)
    setAttendanceSearched(true)
  }

  const handleViewStudents = (classData: any) => {
    const allStudents = userStorage.getStudents()
    const enrolledStudents = classData.students
      .map((studentId: string) => allStudents.find((s) => s.id === studentId))
      .filter(Boolean)
      .sort((a: any, b: any) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
        return nameA.localeCompare(nameB)
      })
    
    setSelectedClassStudents(enrolledStudents)
    setSelectedClassName(`${classData.subjectCode} - ${classData.subjectName}`)
    setIsStudentModalOpen(true)
  }

  const handleViewBulkStudents = () => {
    const sortedStudents = [...matchingStudents].sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
      return nameA.localeCompare(nameB)
    })
    
    setSelectedClassStudents(sortedStudents)
    setSelectedClassName(`${bulkAcademicLevel} - ${bulkCourse} (Year ${bulkYear})`)
    setIsBulkStudentModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Classes & Subjects</h1>
        <p className="text-muted-foreground">Manage subjects and create class sections</p>
      </div>

      <Tabs defaultValue="add-class">
        <TabsList>
          <TabsTrigger value="add-class">Add Class</TabsTrigger>
          <TabsTrigger value="bulk-enroll">Bulk Enroll Students</TabsTrigger>
          <TabsTrigger value="manage-subjects">Manage Subjects</TabsTrigger>
          <TabsTrigger value="view-classes">View Classes</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="add-class">
          <Card>
            <CardHeader>
              <CardTitle>Create Class Section</CardTitle>
              <CardDescription>Add a new class by selecting subject and teacher</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Subject by Code</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter subject code..."
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                  />
                  <Button onClick={handleSearchSubject}>Search</Button>
                </div>
              </div>

              {selectedSubject && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                  <p className="font-semibold">Subject Found</p>
                  <p className="text-sm">
                    <strong>Code:</strong> {selectedSubject.code}
                  </p>
                  <p className="text-sm">
                    <strong>Name:</strong> {selectedSubject.name}
                  </p>
                  <p className="text-sm">
                    <strong>Time:</strong> {selectedSubject.time}
                  </p>
                  <p className="text-sm">
                    <strong>Day:</strong> {selectedSubject.day}
                  </p>
                </div>
              )}

              {selectedSubject && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Teacher</label>
                    <select
                      value={selectedTeacher}
                      onChange={(e) => setSelectedTeacher(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Choose a teacher...</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.firstName} {t.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Semester</label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Year/Level</label>
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                      </select>
                    </div>
                  </div>

                  <Button onClick={handleAddClass} className="w-full bg-green-600 hover:bg-green-700">
                    Create Class
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-enroll">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Enroll Students</CardTitle>
              <CardDescription>
                Enroll multiple students to a class based on academic level, course, and year
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Academic Level</label>
                <select
                  value={bulkAcademicLevel}
                  onChange={(e) => {
                    setBulkAcademicLevel(e.target.value)
                    setBulkCourse("")
                    setBulkYear("")
                  }}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Choose academic level...</option>
                  <option value={ACADEMIC_LEVELS.SENIOR_HIGH}>Senior High School</option>
                  <option value={ACADEMIC_LEVELS.DIPLOMA}>Diploma (College)</option>
                  <option value={ACADEMIC_LEVELS.BACHELOR}>Bachelor (College)</option>
                </select>
              </div>

              {bulkAcademicLevel && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select {bulkAcademicLevel === ACADEMIC_LEVELS.SENIOR_HIGH ? "Strand" : "Course Program"}
                  </label>
                  <select
                    value={bulkCourse}
                    onChange={(e) => {
                      setBulkCourse(e.target.value)
                      setBulkYear("")
                    }}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">
                      Choose {bulkAcademicLevel === ACADEMIC_LEVELS.SENIOR_HIGH ? "strand" : "course"}...
                    </option>
                    {availableCourses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {bulkAcademicLevel && bulkCourse && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Year/Level</label>
                  <select
                    value={bulkYear}
                    onChange={(e) => setBulkYear(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Choose year...</option>
                    {availableYears.map((y) => (
                      <option key={y} value={y}>
                        {bulkAcademicLevel === ACADEMIC_LEVELS.SENIOR_HIGH ? `Grade ${y}` : `Year ${y}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {bulkAcademicLevel && bulkCourse && bulkYear && (
                <>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">{matchingStudents.length} Students Found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          These students will be enrolled to the selected class
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleViewBulkStudents}
                        disabled={matchingStudents.length === 0}
                      >
                        View Students
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Class to Enroll In</label>
                    <select
                      value={bulkClassId}
                      onChange={(e) => setBulkClassId(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Choose a class...</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.subjectCode} - {cls.subjectName} (Teacher: {cls.teacherName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {bulkEnrollMessage && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700">
                      {bulkEnrollMessage}
                    </div>
                  )}

                  <Button
                    onClick={handleBulkEnroll}
                    disabled={matchingStudents.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Enroll All {matchingStudents.length} Students
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage-subjects">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Subject</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Subject Code (e.g., CS101)"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                />
                <Input placeholder="Subject Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Input
                  placeholder="Time (e.g., 8:00 AM - 9:30 AM)"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Day</option>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Units/Credits"
                  type="number"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                />
                <Button onClick={handleCreateSubject} className="w-full">
                  Create Subject
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject List</CardTitle>
              </CardHeader>
              <CardContent>
                {subjects.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No subjects created yet</p>
                ) : (
                  <div className="space-y-2">
                    {subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="p-3 border rounded flex items-start justify-between hover:bg-muted"
                      >
                        <div className="flex-1">
                          <p className="font-semibold">{subject.code}</p>
                          <p className="text-sm text-muted-foreground">{subject.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {subject.day} • {subject.time}
                          </p>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteSubject(subject.id)}>
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="view-classes">
          <Card>
            <CardHeader>
              <CardTitle>All Classes</CardTitle>
              <CardDescription>Classes created from subjects</CardDescription>
            </CardHeader>
            <CardContent>
              {classes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No classes created yet</p>
              ) : (
                <div className="space-y-2">
                  {classes.map((cls) => {
                    const allStudents = userStorage.getStudents()
                    const existingStudents = cls.students.filter((studentId: string) => 
                      allStudents.find((s) => s.id === studentId)
                    )
                    const studentCount = existingStudents.length
                    
                    return (
                      <div key={cls.id} className="p-4 border rounded-lg hover:bg-muted">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">
                              {cls.subjectCode} - {cls.subjectName}
                            </p>
                            <p className="text-sm text-muted-foreground">Teacher: {cls.teacherName}</p>
                            <p className="text-xs text-muted-foreground">
                              Semester {cls.semester} • Year {cls.year} • {cls.day} at {cls.time}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-sm font-medium text-blue-600">
                                {studentCount === 0 
                                  ? 'No Students' 
                                  : `${studentCount} ${studentCount === 1 ? 'Student' : 'Students'} Found`
                                }
                              </p>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewStudents(cls)}
                                disabled={studentCount === 0}
                              >
                                View Students
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

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>View Attendance Records</CardTitle>
              <CardDescription>Search and view attendance by ID or view all records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Attendance ID or Class ID..."
                  value={attendanceSearchId}
                  onChange={(e) => setAttendanceSearchId(e.target.value)}
                />
                <Button onClick={handleSearchAttendance}>Search</Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAttendanceSearchId("")
                    setAttendanceRecords([])
                    setAttendanceSearched(false)
                  }}
                >
                  Clear
                </Button>
              </div>

              {attendanceSearched && (
                <div className="space-y-4">
                  {attendanceRecords.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No attendance records found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Found {attendanceRecords.length} attendance record(s)
                      </p>
                      
                      {attendanceRecords.map((record) => (
                        <Card key={record.id} className="border-2">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">Attendance #{record.id}</CardTitle>
                                <CardDescription>
                                  Date: {new Date(record.date).toLocaleDateString()}
                                </CardDescription>
                              </div>
                              <div className="text-right text-sm">
                                <p className="font-medium">{record.subjectCode}</p>
                                <p className="text-muted-foreground">{record.className}</p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-green-600">
                                    {record.records.filter((r: any) => r.status === "present").length}
                                  </p>
                                  <p className="text-sm text-muted-foreground">Present</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-red-600">
                                    {record.records.filter((r: any) => r.status === "absent").length}
                                  </p>
                                  <p className="text-sm text-muted-foreground">Absent</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-orange-600">
                                    {record.records.filter((r: any) => r.status === "late").length}
                                  </p>
                                  <p className="text-sm text-muted-foreground">Late</p>
                                </div>
                              </div>

                              <div className="border rounded-lg overflow-hidden">
                                <table className="w-full">
                                  <thead className="bg-muted">
                                    <tr>
                                      <th className="text-left p-3 font-medium">Student Name</th>
                                      <th className="text-center p-3 font-medium">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {record.records.map((student: any, idx: number) => (
                                      <tr key={idx} className="border-t">
                                        <td className="p-3">{student.studentName}</td>
                                        <td className="p-3 text-center">
                                          <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                              student.status === "present"
                                                ? "bg-green-100 text-green-700"
                                                : student.status === "absent"
                                                  ? "bg-red-100 text-red-700"
                                                  : "bg-orange-100 text-orange-700"
                                            }`}
                                          >
                                            {student.status.toUpperCase()}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
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

      <Dialog open={isBulkStudentModalOpen} onOpenChange={setIsBulkStudentModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Students to be Enrolled - {selectedClassName}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedClassStudents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No students found</p>
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
    </div>
  )
}
