"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { userStorage, type Student, type Teacher } from "@/lib/storage"
import { useMemo, useState } from "react"
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
  const [editFormData, setEditFormData] = useState({ firstName: "", middleName: "", lastName: "", status: "", email: "" })
  const [addFormData, setAddFormData] = useState<any>({})
  const [refreshKey, setRefreshKey] = useState(0)

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
          status: editFormData.status as any,
        })
      } else {
        userStorage.updateTeacher(editingUser.id, {
          firstName: editFormData.firstName,
          middleName: editFormData.middleName,
          lastName: editFormData.lastName,
          status: editFormData.status as any,
        })
      }
      setRefreshKey((k) => k + 1)
      setEditingUser(null)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const refreshAndExport = () => {
    setRefreshKey((k) => k + 1)
    // Optionally auto-trigger export notification
  }

  const handleDeleteUser = (userId: string, type: "student" | "teacher") => {
    if (confirm("Are you sure you want to delete this account? This action cannot be undone.")) {
      if (type === "student") {
        const students = userStorage.getStudents()
        userStorage.saveStudents(students.filter((s: any) => s.id !== userId))
      } else {
        const teachers = userStorage.getTeachers()
        userStorage.saveTeachers(teachers.filter((t: any) => t.id !== userId))
      }
      refreshAndExport()
    }
  }

  const handleAddStudent = () => {
    try {
      const newStudent: Student = {
        id: generateId("STU"),
        email: addFormData.email,
        password: addFormData.password,
        firstName: addFormData.firstName,
        middleName: addFormData.middleName || "",
        lastName: addFormData.lastName,
        studentId: generateId("ID"),
        academicLevel: addFormData.academicLevel,
        grade: addFormData.grade,
        strand: addFormData.strand,
        year: addFormData.year,
        course: addFormData.course,
        status: "approved",
        registeredAt: new Date().toISOString(),
      }
      userStorage.addStudent(newStudent)
      refreshAndExport() // Use new function
      setAddingUser(null)
      setAddFormData({})
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleAddTeacher = () => {
    try {
      const newTeacher: Teacher = {
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
      }
      userStorage.addTeacher(newTeacher)
      refreshAndExport() // Use new function
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
                          {student.firstName} {student.middleName ? `${student.middleName} ` : ""}{student.lastName}
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
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            student.status === "approved"
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
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(student.id, "student")}>
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
                          {teacher.firstName} {teacher.middleName ? `${teacher.middleName} ` : ""}{teacher.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{teacher.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {teacher.department} - {teacher.subjects.join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            teacher.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {teacher.status}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(teacher, "teacher")}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(teacher.id, "teacher")}>
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
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addingUser === "student"} onOpenChange={() => setAddingUser(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={addFormData.firstName || ""}
                  onChange={(e) => setAddFormData({ ...addFormData, firstName: e.target.value })}
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Middle Name</label>
                <Input
                  value={addFormData.middleName || ""}
                  onChange={(e) => setAddFormData({ ...addFormData, middleName: e.target.value })}
                  placeholder="Middle Name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={addFormData.lastName || ""}
                  onChange={(e) => setAddFormData({ ...addFormData, lastName: e.target.value })}
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={addFormData.email || ""}
                onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                placeholder="student@email.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={addFormData.password || ""}
                onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Academic Level</label>
              <select
                value={addFormData.academicLevel || ""}
                onChange={(e) => setAddFormData({ ...addFormData, academicLevel: e.target.value })}
                className="w-full p-2 border rounded"
              >
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
                  <select
                    value={addFormData.grade || ""}
                    onChange={(e) => setAddFormData({ ...addFormData, grade: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Grade</option>
                    {SENIOR_HIGH_GRADES.map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Strand</label>
                  <select
                    value={addFormData.strand || ""}
                    onChange={(e) => setAddFormData({ ...addFormData, strand: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Strand</option>
                    {SENIOR_HIGH_STRANDS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {addFormData.academicLevel === "diploma" && (
              <>
                <div>
                  <label className="text-sm font-medium">Year</label>
                  <select
                    value={addFormData.year || ""}
                    onChange={(e) => setAddFormData({ ...addFormData, year: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Year</option>
                    {DIPLOMA_YEARS.map((y) => (
                      <option key={y} value={y}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Course</label>
                  <select
                    value={addFormData.course || ""}
                    onChange={(e) => setAddFormData({ ...addFormData, course: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Course</option>
                    {DEFAULT_DIPLOMA_COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {addFormData.academicLevel === "bachelor" && (
              <>
                <div>
                  <label className="text-sm font-medium">Year</label>
                  <select
                    value={addFormData.year || ""}
                    onChange={(e) => setAddFormData({ ...addFormData, year: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Year</option>
                    {BACHELOR_YEARS.map((y) => (
                      <option key={y} value={y}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Course</label>
                  <select
                    value={addFormData.course || ""}
                    onChange={(e) => setAddFormData({ ...addFormData, course: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Course</option>
                    {DEFAULT_BACHELOR_COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setAddingUser(null)}>
                Cancel
              </Button>
              <Button onClick={handleAddStudent}>Add Student</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addingUser === "teacher"} onOpenChange={() => setAddingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={addFormData.firstName || ""}
                  onChange={(e) => setAddFormData({ ...addFormData, firstName: e.target.value })}
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Middle Name</label>
                <Input
                  value={addFormData.middleName || ""}
                  onChange={(e) => setAddFormData({ ...addFormData, middleName: e.target.value })}
                  placeholder="Middle Name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={addFormData.lastName || ""}
                  onChange={(e) => setAddFormData({ ...addFormData, lastName: e.target.value })}
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={addFormData.email || ""}
                onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                placeholder="teacher@email.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={addFormData.password || ""}
                onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Department</label>
              <Input
                value={addFormData.department || ""}
                onChange={(e) => setAddFormData({ ...addFormData, department: e.target.value })}
                placeholder="e.g., Computer Science"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Subjects (comma-separated)</label>
              <Input
                value={addFormData.subjects || ""}
                onChange={(e) => setAddFormData({ ...addFormData, subjects: e.target.value })}
                placeholder="Math, Physics, Chemistry"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setAddingUser(null)}>
                Cancel
              </Button>
              <Button onClick={handleAddTeacher}>Add Teacher</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
