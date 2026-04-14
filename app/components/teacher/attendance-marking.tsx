"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/contexts/auth-context"
import { teacherService } from "@/app/services/teacher-service"
import { classesStorage, userStorage } from "@/lib/storage"
import { useEffect, useState } from "react"
import { generateId } from "@/lib/helpers"

interface AttendanceRecord {
  id: string
  classId: string
  subjectCode: string
  className: string
  date: string
  records: {
    studentId: string
    studentName: string
    status: "present" | "absent" | "late"
  }[]
  createdAt: string
}

export const TeacherAttendanceMarking = () => {
  const { user } = useAuth()
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [attendance, setAttendance] = useState<Record<string, "present" | "absent" | "late">>({})
  const [students, setStudents] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedAttendance, setSavedAttendance] = useState<AttendanceRecord[]>([])
  const [viewingRecord, setViewingRecord] = useState<AttendanceRecord | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentAttendanceId, setCurrentAttendanceId] = useState("")

  useEffect(() => {
    if (user) {
      const teacherClasses = classesStorage.getByTeacherId(user.id)
      setClasses(teacherClasses)
      
      // Load saved attendance
      const saved = localStorage.getItem("attendance")
      if (saved) {
        setSavedAttendance(JSON.parse(saved))
      }
    }
  }, [user])

  useEffect(() => {
    if (selectedClass) {
      const classItem = classes.find((c) => c.id === selectedClass)
      if (classItem) {
        const allStudents = userStorage.getStudents()
        const enrolledStudents = allStudents.filter((s) => 
          classItem.students.includes(s.id)
        )
        setStudents(enrolledStudents)
        
        // Initialize all students as present by default
        const initialAttendance: Record<string, "present" | "absent" | "late"> = {}
        enrolledStudents.forEach((student) => {
          initialAttendance[student.id] = "present"
        })
        setAttendance(initialAttendance)
        
        const shortId = generateId("ATT").split("_")[1]
        setCurrentAttendanceId(shortId)
      }
    } else {
      setStudents([])
      setAttendance({})
      setCurrentAttendanceId("")
    }
  }, [selectedClass, classes])

  const handleStatusChange = (studentId: string, status: "present" | "absent" | "late") => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleSubmitAttendance = () => {
    if (!selectedClass || students.length === 0) return

    setIsSubmitting(true)
    try {
      const classInfo = classes.find((c) => c.id === selectedClass)
      const attendanceRecord: AttendanceRecord = {
        id: currentAttendanceId, // Use the simple ID format
        classId: selectedClass,
        subjectCode: classInfo?.subjectCode || "",
        className: classInfo?.subjectName || "",
        date: selectedDate,
        records: students.map((student) => ({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          status: attendance[student.id] || "present",
        })),
        createdAt: new Date().toISOString(),
      }

      const existingRecords = JSON.parse(localStorage.getItem("attendance") || "[]")
      const allRecords = [...existingRecords, attendanceRecord]
      localStorage.setItem("attendance", JSON.stringify(allRecords))
      setSavedAttendance(allRecords)

      alert("Attendance submitted successfully!")
      
      // Reset form
      setSelectedClass("")
      setAttendance({})
      setStudents([])
      setCurrentAttendanceId("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewDetails = (record: AttendanceRecord) => {
    setViewingRecord(record)
    setIsViewModalOpen(true)
  }

  const handleDeleteAttendance = (recordId: string) => {
    if (!confirm("Are you sure you want to delete this attendance record? This action cannot be undone.")) {
      return
    }
    
    const existingRecords = JSON.parse(localStorage.getItem("attendance") || "[]")
    const updatedRecords = existingRecords.filter((r: AttendanceRecord) => r.id !== recordId)
    localStorage.setItem("attendance", JSON.stringify(updatedRecords))
    setSavedAttendance(updatedRecords)
    
    if (viewingRecord?.id === recordId) {
      setIsViewModalOpen(false)
      setViewingRecord(null)
    }
  }

  const selectedClassInfo = classes.find((c) => c.id === selectedClass)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mark Attendance</h1>
        <p className="text-muted-foreground">Record student attendance for your classes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Class</CardTitle>
          <CardDescription>Choose a class and date to mark attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
                    {cls.subjectCode} - {cls.subjectName} ({cls.day} {cls.time})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>
          </div>

          {selectedClass && students.length > 0 && (
            <div className="space-y-4 mt-6">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-lg">
                  Attendance #{currentAttendanceId}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Date: {new Date(selectedDate).toLocaleDateString()} | Class: {selectedClassInfo?.subjectCode}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border px-4 py-2 text-left">Student</th>
                      <th className="border border-border px-4 py-2 text-center">Present</th>
                      <th className="border border-border px-4 py-2 text-center">Absent</th>
                      <th className="border border-border px-4 py-2 text-center">Late</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-muted/50">
                        <td className="border border-border px-4 py-3">
                          <div>
                            <p className="font-medium">{student.firstName} {student.lastName}</p>
                            <p className="text-sm text-muted-foreground">{student.studentId}</p>
                          </div>
                        </td>
                        <td className="border border-border px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={attendance[student.id] === "present"}
                            onChange={() => handleStatusChange(student.id, "present")}
                            className="w-5 h-5 cursor-pointer"
                          />
                        </td>
                        <td className="border border-border px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={attendance[student.id] === "absent"}
                            onChange={() => handleStatusChange(student.id, "absent")}
                            className="w-5 h-5 cursor-pointer"
                          />
                        </td>
                        <td className="border border-border px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={attendance[student.id] === "late"}
                            onChange={() => handleStatusChange(student.id, "late")}
                            className="w-5 h-5 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button 
                onClick={handleSubmitAttendance} 
                disabled={isSubmitting} 
                className="w-full mt-4 h-11 font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Attendance"}
              </Button>
            </div>
          )}

          {selectedClass && students.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No students enrolled in this class yet.
            </div>
          )}
        </CardContent>
      </Card>

      {savedAttendance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>Previously submitted attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedAttendance.slice().reverse().map((record) => {
                const classInfo = classes.find((c) => c.id === record.classId)
                const presentCount = record.records.filter((r) => r.status === "present").length
                const absentCount = record.records.filter((r) => r.status === "absent").length
                const lateCount = record.records.filter((r) => r.status === "late").length

                return (
                  <div key={record.id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{classInfo?.subjectCode} - {classInfo?.subjectName}</p>
                        <p className="text-sm text-muted-foreground">
                          Date: {new Date(record.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          ID: {record.id}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right text-sm">
                          <p className="text-green-600">Present: {presentCount}</p>
                          <p className="text-red-600">Absent: {absentCount}</p>
                          <p className="text-yellow-600">Late: {lateCount}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            className="h-8 px-4 text-xs font-medium bg-accent/10 hover:bg-accent/20 text-accent transition-colors"
                            onClick={() => handleViewDetails(record)}
                          >
                            View Details
                          </Button>
                          <Button 
                            className="h-8 px-4 text-xs font-medium bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
                            onClick={() => handleDeleteAttendance(record.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {isViewModalOpen && viewingRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Attendance Details</h2>
                  <p className="text-sm text-muted-foreground mt-1">Attendance ID: {viewingRecord.id}</p>
                </div>
                <Button 
                  className="h-9 px-4 font-medium text-foreground hover:bg-muted transition-colors"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Class</p>
                    <p className="font-medium">{viewingRecord.subjectCode} - {viewingRecord.className}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{new Date(viewingRecord.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">Student Name</th>
                        <th className="text-center p-3 font-medium">Present</th>
                        <th className="text-center p-3 font-medium">Absent</th>
                        <th className="text-center p-3 font-medium">Late</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingRecord.records.map((student, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-3">{student.studentName}</td>
                          <td className="p-3 text-center">
                            <input 
                              type="checkbox" 
                              checked={student.status === "present"} 
                              disabled 
                              className="w-5 h-5"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input 
                              type="checkbox" 
                              checked={student.status === "absent"} 
                              disabled 
                              className="w-5 h-5"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input 
                              type="checkbox" 
                              checked={student.status === "late"} 
                              disabled 
                              className="w-5 h-5"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
