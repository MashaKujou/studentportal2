"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { userStorage, type Student, type Teacher } from "@/lib/storage"
import { useMemo, useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  SENIOR_HIGH_GRADES,
  SENIOR_HIGH_STRANDS,
  DIPLOMA_YEARS,
  BACHELOR_YEARS,
  DEFAULT_DIPLOMA_COURSES,
  DEFAULT_BACHELOR_COURSES,
} from "@/lib/constants"
import { generateId } from "@/lib/helpers"
import { ExportAccounts } from './export-accounts'

export const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingUser, setEditingUser] = useState<any>(null)
  const [addingUser, setAddingUser] = useState<"student" | "teacher" | null>(null)
  const [deletingUser, setDeletingUser] = useState<{ user: any; type: "student" | "teacher" } | null>(null)
  const [toast, setToast] = useState<{ user: any; type: "student" | "teacher" } | null>(null)
  const [toastProgress, setToastProgress] = useState(100)
  const [editFormData, setEditFormData] = useState({ firstName: "", middleName: "", lastName: "", status: "", email: "" })
  const [addFormData, setAddFormData] = useState<any>({})
  const [refreshKey, setRefreshKey] = useState(0)
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const TOAST_DURATION = 5000

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [])

  const dismissToast = () => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current)
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    setToast(null)
    setToastProgress(100)
  }

  const showToast = (user: any, type: "student" | "teacher") => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current)
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)

    setToast({ user, type })
    setToastProgress(100)

    const startTime = Date.now()
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / TOAST_DURATION) * 100)
      setToastProgress(remaining)
    }, 50)

    undoTimeoutRef.current = setTimeout(() => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      setToast(null)
      setToastProgress(100)
    }, TOAST_DURATION)
  }

  const students = useMemo(() => {
    const all = userStorage.getStudents()
    return all.filter(
      (s: any) =>
        s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery, refreshKey])

  const teachers = useMemo(() => {
    const all = userStorage.getTeachers()
    return all.filter(
      (t: any) =>
        t.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery, refreshKey])

  const handleEditClick = (user: any, type: "student" | "teacher") => {
    setEditingUser({ ...user, type })
    setEditFormData({
      firstName: user.firstName,
      middleName: user.middleName || "",
      lastName: user.lastName,
      status: user.status,
      email: user.email,
    })
  }

  const handleSaveEdit = () => {
    try {
      if (editingUser.type === "student") {
        userStorage.updateStudent(editingUser.id, {
          firstName: editFormData.firstName,
          middleName: editFormData.middleName,
          lastName: editFormData.lastName,
          status: editFormData.status,
        } as any)
      } else {
        userStorage.updateTeacher(editingUser.id, {
          firstName: editFormData.firstName,
          middleName: editFormData.middleName,
          lastName: editFormData.lastName,
          status: editFormData.status,
        } as any)
      }
      setRefreshKey((k) => k + 1)
      setEditingUser(null)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const refreshAndExport = () => {
    setRefreshKey((k) => k + 1)
  }

  const handleDeleteClick = (user: any, type: "student" | "teacher") => {
    setDeletingUser({ user, type })
  }

  const handleConfirmDelete = () => {
    if (!deletingUser) return
    const { user, type } = deletingUser
    if (type === "student") {
      userStorage.deleteStudent(user.id)
    } else {
      userStorage.deleteTeacher(user.id)
    }
    refreshAndExport()
    setDeletingUser(null)
    showToast(user, type)
  }

  const handleUndo = () => {
    if (!toast) return
    const { user, type } = toast
    try {
      if (type === "student") {
        userStorage.addStudent(user as Student)
      } else {
        userStorage.addTeacher(user as Teacher)
      }
      refreshAndExport()
    } catch (e) {
      // user may already exist, ignore
    }
    dismissToast()
  }

  const handleAddStudent = () => {
    try {
      if (!addFormData.studentId || !/^\d{4}-\d{2}-\d{3}$/.test(addFormData.studentId)) {
        alert("Student ID must follow format ####-##-###")
        return
      }

      const newStudent = {
        id: generateId("STU"),
        email: addFormData.email,
        password: addFormData.password,
        firstName: addFormData.firstName,
        middleName: addFormData.middleName || "",
        lastName: addFormData.lastName,
        studentId: addFormData.studentId,
        academicLevel: addFormData.academicLevel,
        grade: addFormData.grade,
        strand: addFormData.strand,
        year: addFormData.year,
        course: addFormData.course,
        status: "approved",
        registeredAt: new Date().toISOString(),
      } as Student
      userStorage.addStudent(newStudent)
      refreshAndExport()
      setAddingUser(null)
      setAddFormData({})
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleAddTeacher = () => {
    try {
      const newTeacher = {
        id: generateId("TCH"),
        email: addFormData.email,
        password: addFormData.password,
        firstName: addFormData.firstName,
        middleName: addFormData.middleName || "",
        lastName: addFormData.lastName,
        teacherId: generateId("ID"),
        department: addFormData.department,
        subjects: addFormData.subjects?.split(",").map((s: string) => s.trim()) || [],
        status: "active",
        registeredAt: new Date().toISOString(),
      } as Teacher
      userStorage.addTeacher(newTeacher)
      refreshAndExport()
      setAddingUser(null)
      setAddFormData({})
    } catch (error: any) {
      alert(error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage all system users</p>
        </div>
      </div>

      <ExportAccounts />

      <div>
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
          <TabsTrigger value="teachers">Teachers ({teachers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <div className="mb-4">
            <Button onClick={() => setAddingUser("student")}>Add New Student</Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Student List</CardTitle>
              <CardDescription>All registered students in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No students found</p>
              ) : (
                <div className="space-y-2">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="p-4 border border-border rounded-lg flex items-center justify-between hover:bg-muted"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">
                          {student.firstName} {(student as any).middleName ? `${(student as any).middleName} ` : ""}{student.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {student.academicLevel === "senior_high"
                            ? `Grade ${student.grade}`
                            : `${student.course} Year ${student.year}`}{" "}
                          - {student.studentId}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${student.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : student.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {student.status}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(student, "student")}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(student, "student")}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers">
          <div className="mb-4">
            <Button onClick={() => setAddingUser("teacher")}>Add New Teacher</Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Teacher List</CardTitle>
              <CardDescription>All registered teachers in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {teachers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No teachers found</p>
              ) : (
                <div className="space-y-2">
                  {teachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="p-4 border border-border rounded-lg flex items-center justify-between hover:bg-muted"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">
                          {teacher.firstName} {(teacher as any).middleName ? `${(teacher as any).middleName} ` : ""}{teacher.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{teacher.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {teacher.department} - {teacher.subjects.join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${teacher.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                        >
                          {teacher.status}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(teacher, "teacher")}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(teacher, "teacher")}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            {deletingUser && (
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-1">
                <p className="font-semibold text-sm">
                  {deletingUser.user.firstName}{" "}
                  {deletingUser.user.middleName ? `${deletingUser.user.middleName} ` : ""}
                  {deletingUser.user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{deletingUser.user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  Role: {deletingUser.type === "student" ? "Student" : "Teacher"}
                </p>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeletingUser(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser?.type === "student" ? "Edit Student" : "Edit Teacher"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">First Name</label>
              <Input
                value={editFormData.firstName}
                onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Middle Name</label>
              <Input
                value={editFormData.middleName}
                onChange={(e) => setEditFormData({ ...editFormData, middleName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <Input
                value={editFormData.lastName}
                onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                className="w-full p-2 border rounded"
              >
                {editingUser?.type === "student" ? (
                  <>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="suspended">Suspended</option>
                  </>
                ) : (
                  <>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </>
                )}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={addingUser === "student"} onOpenChange={() => setAddingUser(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <Input value={addFormData.firstName || ""} onChange={(e) => setAddFormData({ ...addFormData, firstName: e.target.value })} placeholder="First Name" />
              </div>
              <div>
                <label className="text-sm font-medium">Middle Name</label>
                <Input value={addFormData.middleName || ""} onChange={(e) => setAddFormData({ ...addFormData, middleName: e.target.value })} placeholder="Middle Name" />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <Input value={addFormData.lastName || ""} onChange={(e) => setAddFormData({ ...addFormData, lastName: e.target.value })} placeholder="Last Name" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={addFormData.email || ""} onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })} placeholder="student@email.com" />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input type="password" value={addFormData.password || ""} onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })} placeholder="Enter password" />
            </div>
            <div>
              <label className="text-sm font-medium">Student ID</label>
              <Input
                value={addFormData.studentId || ""}
                onChange={(e) => {
                  let digits = e.target.value.replace(/\D/g, "")
                  if (digits.length > 9) digits = digits.slice(0, 9)
                  let formatted = digits
                  if (digits.length > 4) formatted = digits.slice(0, 4) + "-" + digits.slice(4)
                  if (digits.length > 6) formatted = digits.slice(0, 4) + "-" + digits.slice(4, 6) + "-" + digits.slice(6)
                  setAddFormData({ ...addFormData, studentId: formatted })
                }}
                placeholder="1234-56-789"
                maxLength={11}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Academic Level</label>
              <select value={addFormData.academicLevel || ""} onChange={(e) => setAddFormData({ ...addFormData, academicLevel: e.target.value })} className="w-full p-2 border rounded">
                <option value="">Select Level</option>
                <option value="senior_high">Senior High School</option>
                <option value="diploma">Diploma</option>
                <option value="bachelor">Bachelor</option>
              </select>
            </div>
            {addFormData.academicLevel === "senior_high" && (
              <>
                <div>
                  <label className="text-sm font-medium">Grade</label>
                  <select value={addFormData.grade || ""} onChange={(e) => setAddFormData({ ...addFormData, grade: e.target.value })} className="w-full p-2 border rounded">
                    <option value="">Select Grade</option>
                    {SENIOR_HIGH_GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Strand</label>
                  <select value={addFormData.strand || ""} onChange={(e) => setAddFormData({ ...addFormData, strand: e.target.value })} className="w-full p-2 border rounded">
                    <option value="">Select Strand</option>
                    {SENIOR_HIGH_STRANDS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </>
            )}
            {addFormData.academicLevel === "diploma" && (
              <>
                <div>
                  <label className="text-sm font-medium">Year</label>
                  <select value={addFormData.year || ""} onChange={(e) => setAddFormData({ ...addFormData, year: e.target.value })} className="w-full p-2 border rounded">
                    <option value="">Select Year</option>
                    {DIPLOMA_YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Course</label>
                  <select value={addFormData.course || ""} onChange={(e) => setAddFormData({ ...addFormData, course: e.target.value })} className="w-full p-2 border rounded">
                    <option value="">Select Course</option>
                    {DEFAULT_DIPLOMA_COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </>
            )}
            {addFormData.academicLevel === "bachelor" && (
              <>
                <div>
                  <label className="text-sm font-medium">Year</label>
                  <select value={addFormData.year || ""} onChange={(e) => setAddFormData({ ...addFormData, year: e.target.value })} className="w-full p-2 border rounded">
                    <option value="">Select Year</option>
                    {BACHELOR_YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Course</label>
                  <select value={addFormData.course || ""} onChange={(e) => setAddFormData({ ...addFormData, course: e.target.value })} className="w-full p-2 border rounded">
                    <option value="">Select Course</option>
                    {DEFAULT_BACHELOR_COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setAddingUser(null)}>Cancel</Button>
              <Button onClick={handleAddStudent}>Add Student</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Teacher Dialog */}
      <Dialog open={addingUser === "teacher"} onOpenChange={() => setAddingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <Input value={addFormData.firstName || ""} onChange={(e) => setAddFormData({ ...addFormData, firstName: e.target.value })} placeholder="First Name" />
              </div>
              <div>
                <label className="text-sm font-medium">Middle Name</label>
                <Input value={addFormData.middleName || ""} onChange={(e) => setAddFormData({ ...addFormData, middleName: e.target.value })} placeholder="Middle Name" />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <Input value={addFormData.lastName || ""} onChange={(e) => setAddFormData({ ...addFormData, lastName: e.target.value })} placeholder="Last Name" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={addFormData.email || ""} onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })} placeholder="teacher@email.com" />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input type="password" value={addFormData.password || ""} onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })} placeholder="Enter password" />
            </div>
            <div>
              <label className="text-sm font-medium">Department</label>
              <Input value={addFormData.department || ""} onChange={(e) => setAddFormData({ ...addFormData, department: e.target.value })} placeholder="e.g., Computer Science" />
            </div>
            <div>
              <label className="text-sm font-medium">Subjects (comma-separated)</label>
              <Input value={addFormData.subjects || ""} onChange={(e) => setAddFormData({ ...addFormData, subjects: e.target.value })} placeholder="Math, Physics, Chemistry" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setAddingUser(null)}>Cancel</Button>
              <Button onClick={handleAddTeacher}>Add Teacher</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Undo Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
          <div className="bg-gray-900 text-white rounded-xl shadow-2xl overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Account Successfully Deleted</p>
                  <p className="text-xs text-gray-400 truncate">
                    {toast.user.firstName} {toast.user.lastName} &middot; {toast.type === "student" ? "Student" : "Teacher"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleUndo}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-white/10"
                >
                  Undo
                </button>
                <button
                  onClick={dismissToast}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                  aria-label="Dismiss"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-0.5 bg-gray-700">
              <div
                className="h-full bg-green-500 transition-all duration-75 ease-linear"
                style={{ width: `${toastProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}