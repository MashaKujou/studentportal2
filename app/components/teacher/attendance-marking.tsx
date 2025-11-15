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

  useEffect(() => {
    if (user) {
      const teacherClasses = classesStorage.getByTeacherId(user.id)
      setClasses(teacherClasses)
      
      // Load saved attendance
      const saved = localStorage.getItem("attendance_records")
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
      }
    } else {
      setStudents([])
      setAttendance({})
    }
  }, [selectedClass, classes])

  const handleStatusChange = (studentId: string, status: "present" | "absent" | "late") => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleSubmitAttendance = () => {
    if (!selectedClass || students.length === 0) return

    setIsSubmitting(true)
    try {
      const attendanceRecord: AttendanceRecord = {
        id: generateId("ATT"),
        classId: selectedClass,
        date: selectedDate,
        records: students.map((student) => ({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          status: attendance[student.id] || "present",
        })),
        createdAt: new Date().toISOString(),
      }

      // Save to localStorage
      const allRecords = [...savedAttendance, attendanceRecord]
      localStorage.setItem("attendance_records", JSON.stringify(allRecords))
      setSavedAttendance(allRecords)

      alert("Attendance submitted successfully!")
      
      // Reset form
      setSelectedClass("")
      setAttendance({})
      setStudents([])
    } finally {
      setIsSubmitting(false)
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
                  Attendance #{generateId("NUM").split("_")[1]}
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

              <Button onClick={handleSubmitAttendance} disabled={isSubmitting} className="w-full mt-4">
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
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-green-600">Present: {presentCount}</p>
                        <p className="text-red-600">Absent: {absentCount}</p>
                        <p className="text-yellow-600">Late: {lateCount}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
