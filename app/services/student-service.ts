import { STORAGE_KEYS } from "@/lib/constants"
import { storage, userStorage } from "@/lib/storage"
import { generateId } from "@/lib/helpers"

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
  status: "pending" | "approved" | "rejected" | "completed"
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

export const studentService = {
  // Grade operations
  getGrades: (studentId: string): Grade[] => {
    const grades = storage.get<Grade[]>(STORAGE_KEYS.GRADES) || []
    return grades.filter((g) => g.studentId === studentId)
  },

  addGrade: (grade: Omit<Grade, "id" | "createdAt">): Grade => {
    const newGrade: Grade = {
      ...grade,
      id: generateId("GRD"),
      createdAt: new Date().toISOString(),
    }
    const grades = storage.get<Grade[]>(STORAGE_KEYS.GRADES) || []
    grades.push(newGrade)
    storage.set(STORAGE_KEYS.GRADES, grades)
    return newGrade
  },

  // Attendance operations
  getAttendance: (studentId: string): Attendance[] => {
    const attendance = storage.get<Attendance[]>(STORAGE_KEYS.ATTENDANCE) || []
    return attendance.filter((a) => a.studentId === studentId)
  },

  recordAttendance: (attendance: Omit<Attendance, "id" | "createdAt">): Attendance => {
    const newAttendance: Attendance = {
      ...attendance,
      id: generateId("ATT"),
      createdAt: new Date().toISOString(),
    }
    const allAttendance = storage.get<Attendance[]>(STORAGE_KEYS.ATTENDANCE) || []
    allAttendance.push(newAttendance)
    storage.set(STORAGE_KEYS.ATTENDANCE, allAttendance)
    return newAttendance
  },

  // Request operations
  getRequests: (studentId: string): Request[] => {
    return storage.get<Request[]>(`requests_${studentId}`) || []
  },

  createRequest: (request: Omit<Request, "id" | "createdAt">): Request => {
    const newRequest: Request = {
      ...request,
      id: generateId("REQ"),
      createdAt: new Date().toISOString(),
    }
    const requests = storage.get<Request[]>(`requests_${request.studentId}`) || []
    requests.push(newRequest)
    storage.set(`requests_${request.studentId}`, requests)
    return newRequest
  },

  getRequestHistory: (studentId: string) => {
    return storage.get<any[]>(`requests_${studentId}`) || []
  },

  // Schedule operations
  getSchedule: (studentId: string): Schedule[] => {
    const schedules = storage.get<Schedule[]>(STORAGE_KEYS.SCHEDULES) || []
    return schedules.filter((s) => s.studentId === studentId)
  },

  addSchedule: (schedule: Omit<Schedule, "id" | "createdAt">): Schedule => {
    const newSchedule: Schedule = {
      ...schedule,
      id: generateId("SCH"),
      createdAt: new Date().toISOString(),
    }
    const schedules = storage.get<Schedule[]>(STORAGE_KEYS.SCHEDULES) || []
    schedules.push(newSchedule)
    storage.set(STORAGE_KEYS.SCHEDULES, schedules)
    return newSchedule
  },

  // Document operations
  getDocuments: (studentId: string): Document[] => {
    const documents = storage.get<Document[]>(STORAGE_KEYS.DOCUMENTS) || []
    return documents.filter((d) => d.studentId === studentId)
  },

  uploadDocument: (document: Omit<Document, "id" | "uploadedAt">): Document => {
    const newDocument: Document = {
      ...document,
      id: generateId("DOC"),
      uploadedAt: new Date().toISOString(),
    }
    const documents = storage.get<Document[]>(STORAGE_KEYS.DOCUMENTS) || []
    documents.push(newDocument)
    storage.set(STORAGE_KEYS.DOCUMENTS, documents)
    return newDocument
  },

  deleteDocument: (documentId: string, studentId: string): void => {
    const documents = storage.get<Document[]>(STORAGE_KEYS.DOCUMENTS) || []
    storage.set(
      STORAGE_KEYS.DOCUMENTS,
      documents.filter((d) => !(d.id === documentId && d.studentId === studentId)),
    )
  },

  // Student profile operations
  updateStudentProfile: (studentId: string, updates: { profilePicture?: string; password?: string }): void => {
    userStorage.updateStudent(studentId, {
      profilePicture: updates.profilePicture,
      lastPasswordChange: updates.password ? new Date().toISOString() : undefined,
      password: updates.password || undefined,
    } as any)
  },

  getStudentProfile: (studentId: string) => {
    const students = userStorage.getStudents()
    return students.find((s) => s.id === studentId)
  },
}
