export interface Grade {
  id: string
  studentId: string
  subject: string
  score: number
  term: string
  semester: string
  createdAt: string
}

export interface Attendance {
  id: string
  studentId: string
  date: string
  status: "present" | "absent" | "late" | "excused"
  subject: string
  createdAt: string
}

export interface Request {
  id: string
  studentId: string
  type: string
  status: "pending" | "approved" | "rejected" | "completed" | "read" | "in_progress"
  reason: string
  createdAt: string
  completedAt?: string
}

export interface Schedule {
  id: string
  studentId: string
  day: string
  time: string
  subject: string
  teacher: string
  room: string
  createdAt: string
}

export interface Document {
  id: string
  studentId: string
  name: string
  url: string
  type: string
  uploadedAt: string
}

// 🔧 Helper to safely get data
const getData = (key: string) => {
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

// 🔧 Helper to save data
const setData = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const studentService = {
  // =========================
  // 📊 GRADES
  // =========================
  getGrades: (studentId: string): Grade[] => {
    const grades = getData("grades")
    return grades.filter((g: Grade) => g.studentId === studentId)
  },

  addGrade: (grade: Grade) => {
    const grades = getData("grades")
    grades.push(grade)
    setData("grades", grades)
  },

  // =========================
  // 📅 ATTENDANCE
  // =========================
  getAttendance: (studentId: string): Attendance[] => {
    const attendance = getData("attendance")
    return attendance.filter((a: Attendance) => a.studentId === studentId)
  },

  addAttendance: (attendanceRecord: Attendance) => {
    const attendance = getData("attendance")
    attendance.push(attendanceRecord)
    setData("attendance", attendance)
  },

  // =========================
  // 📝 REQUESTS
  // =========================
  getRequests: (studentId: string): Request[] => {
    const requests = getData("requests")
    return requests.filter((r: Request) => r.studentId === studentId)
  },

  createRequest: (request: Request) => {
    const requests = getData("requests")
    requests.push(request)
    setData("requests", requests)
  },

  updateRequestStatus: (requestId: string, status: Request["status"]) => {
    const requests = getData("requests")

    const updated = requests.map((r: Request) => {
      if (r.id === requestId) {
        return {
          ...r,
          status,
          completedAt: status === "completed" ? new Date().toISOString() : r.completedAt,
        }
      }
      return r
    })

    setData("requests", updated)
  },

  // =========================
  // 📚 SCHEDULE
  // =========================
  getSchedule: (studentId: string): Schedule[] => {
    const schedules = getData("schedules")
    return schedules.filter((s: Schedule) => s.studentId === studentId)
  },

  addSchedule: (schedule: Schedule) => {
    const schedules = getData("schedules")
    schedules.push(schedule)
    setData("schedules", schedules)
  },

  // =========================
  // 📂 DOCUMENTS
  // =========================
  getDocuments: (studentId: string): Document[] => {
    const documents = getData("documents")
    return documents.filter((d: Document) => d.studentId === studentId)
  },

  uploadDocument: (document: Document) => {
    const documents = getData("documents")
    documents.push(document)
    setData("documents", documents)
  },

  deleteDocument: (documentId: string) => {
    const documents = getData("documents")
    const filtered = documents.filter((d: Document) => d.id !== documentId)
    setData("documents", filtered)
  },

  // =========================
  // 👤 PROFILE (LOCAL ONLY)
  // =========================
  getStudentProfile: (studentId: string) => {
    const students = getData("students")
    return students.find((s: any) => s.id === studentId)
  },

  updateStudentProfile: (
    studentId: string,
    updates: { profilePicture?: string; password?: string }
  ) => {
    const students = getData("students")

    const updated = students.map((s: any) => {
      if (s.id === studentId) {
        return {
          ...s,
          ...updates,
          lastPasswordChange: updates.password ? new Date().toISOString() : s.lastPasswordChange,
        }
      }
      return s
    })

    setData("students", updated)
  },
}