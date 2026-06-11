import { STORAGE_KEYS } from "@/lib/constants"

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

const getRequestsData = (): Request[] => {
  const scopedRequests = getData(STORAGE_KEYS.REQUESTS)
  const legacyRequests = getData("requests")
  const combined = [...scopedRequests, ...legacyRequests]
  const uniqueById = new Map<string, Request>()
  combined.forEach((req: Request) => {
    const normalizedId = req?.id || `REQ_${Math.random().toString(36).slice(2, 11)}`
    uniqueById.set(normalizedId, {
      ...req,
      id: normalizedId,
      createdAt: req?.createdAt || new Date().toISOString(),
    })
  })
  return Array.from(uniqueById.values())
}

const setRequestsData = (requests: Request[]) => {
  setData(STORAGE_KEYS.REQUESTS, requests)
  // Keep legacy key in sync for older pages/data.
  setData("requests", requests)
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
    const requests = getRequestsData()
    return requests.filter((r: Request) => r.studentId === studentId)
  },

  getAllRequests: (): Request[] => {
    return getRequestsData()
  },

  createRequest: (request: Omit<Request, "id" | "createdAt"> & Partial<Pick<Request, "id" | "createdAt">>) => {
    const requests = getRequestsData()
    const newRequest: Request = {
      ...request,
      id: request.id || `REQ_${Math.random().toString(36).slice(2, 11)}`,
      createdAt: request.createdAt || new Date().toISOString(),
    }
    requests.push(newRequest)
    setRequestsData(requests)
  },

  updateRequestStatus: (requestId: string, status: Request["status"]) => {
    const requests = getRequestsData()

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

    setRequestsData(updated)
  },

  deleteRequest: (requestId: string) => {
    const requests = getRequestsData()
    const updated = requests.filter((r: Request) => r.id !== requestId)
    setRequestsData(updated)
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