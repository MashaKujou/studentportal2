import { storage, userStorage, type Student, type Teacher } from "@/lib/storage"
import { generateId } from "@/lib/helpers"
import { subjectStorage, classesStorage, requestMessagesStorage, type Subject, type Class } from "@/lib/storage"
import { STORAGE_KEYS } from "@/lib/constants"

export const adminService = {
  // Student approval operations
  getPendingStudents: (): Student[] => {
    const students = userStorage.getStudents()
    return students.filter((s) => s.status === "pending")
  },

  approveStudent: (studentId: string): void => {
    userStorage.updateStudent(studentId, {
      status: "approved",
      approvedAt: new Date().toISOString(),
      approvedBy: "admin",
    })
  },

  rejectStudent: (studentId: string): void => {
    userStorage.updateStudent(studentId, {
      status: "rejected",
    })
  },

  // User management
  getAllStudents: (): Student[] => {
    return userStorage.getStudents()
  },

  getAllTeachers: (): Teacher[] => {
    return userStorage.getTeachers()
  },

  getSystemStatistics: () => {
    const students = userStorage.getStudents()
    const teachers = userStorage.getTeachers()
    const admins = userStorage.getAdmins()

    return {
      totalStudents: students.length,
      approvedStudents: students.filter((s) => s.status === "approved").length,
      pendingStudents: students.filter((s) => s.status === "pending").length,
      totalTeachers: teachers.length,
      activeTeachers: teachers.filter((t) => t.status === "active").length,
      totalAdmins: admins.length,
      totalClasses: classesStorage.getAll().length,
      totalSubjects: subjectStorage.getAll().length,
    }
  },

  updateUserStatus: (userId: string, status: string, userType: "student" | "teacher" | "admin"): void => {
    if (userType === "student") {
      userStorage.updateStudent(userId, { status: status as any })
    } else if (userType === "teacher") {
      userStorage.updateTeacher(userId, { status: status as any })
    }
  },

  // Announcements
  getAnnouncements: () => {
    return storage.get<any[]>("admin_announcements") || []
  },

  createAnnouncement: (title: string, message: string, priority: "low" | "medium" | "high") => {
    const announcement = {
      id: generateId("ANN"),
      title,
      message,
      priority,
      createdAt: new Date().toISOString(),
    }
    const announcements = adminService.getAnnouncements()
    announcements.push(announcement)
    storage.set("admin_announcements", announcements)
    return announcement
  },

  getAllRequests: () => {
    const students = userStorage.getStudents()
    const requests: any[] = []

    students.forEach((student) => {
      const studentRequests = storage.get<any[]>(`requests_${student.id}`) || []
      requests.push(
        ...studentRequests.map((r) => ({
          ...r,
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          studentEmail: student.email,
        })),
      )
    })

    return requests
  },

  updateRequestStatus: (requestId: string, studentId: string, status: string): void => {
    const requests = storage.get<any[]>(`requests_${studentId}`) || []
    const request = requests.find((r) => r.id === requestId)
    if (request) {
      request.status = status
      if (status === "completed" || status === "rejected") {
        request.completedAt = new Date().toISOString()
      }
      storage.set(`requests_${studentId}`, requests)
    }
  },

  addRequestMessage: (requestId: string, studentId: string, message: string, senderRole: "admin" | "student"): void => {
    requestMessagesStorage.add({
      requestId,
      senderId: senderRole === "admin" ? "admin" : studentId,
      senderRole,
      message,
    })
  },

  getRequestMessages: (requestId: string) => {
    return requestMessagesStorage.getByRequestId(requestId)
  },

  createRequest: (studentId: string, type: string): void => {
    const requests = storage.get<any[]>(`requests_${studentId}`) || []
    requests.push({
      id: generateId("REQ"),
      studentId,
      type,
      status: "pending",
      createdAt: new Date().toISOString(),
    })
    storage.set(`requests_${studentId}`, requests)
  },

  createSubject: (code: string, name: string, time: string, day: string, unit: string): Subject => {
    return subjectStorage.add({ code, name, time, day, unit })
  },

  getAllSubjects: (): Subject[] => {
    return subjectStorage.getAll()
  },

  getSubjectByCode: (code: string): Subject | undefined => {
    return subjectStorage.getByCode(code)
  },

  deleteSubject: (id: string): void => {
    subjectStorage.delete(id)
  },

  addClass: (subjectCode: string, teacherId: string, semester: string, year: string): Class => {
    const subject = subjectStorage.getByCode(subjectCode)
    if (!subject) {
      throw new Error("Subject not found")
    }
    const teacher = userStorage.getTeachers().find((t) => t.id === teacherId)
    if (!teacher) {
      throw new Error("Teacher not found")
    }
    return classesStorage.add({
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectName: subject.name,
      teacherId,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      time: subject.time,
      day: subject.day,
      semester,
      year,
      students: [],
    })
  },

  // Bulk enrollment function
  bulkEnrollStudents: (classId: string, studentIds: string[]): void => {
    const allClasses = classesStorage.getAll()
    const classIndex = allClasses.findIndex((c) => c.id === classId)

    if (classIndex !== -1) {
      // Add new students and prevent duplicates
      const existingStudents = new Set(allClasses[classIndex].students)
      studentIds.forEach((studentId) => existingStudents.add(studentId))

      allClasses[classIndex].students = Array.from(existingStudents)
      storage.set("classes", allClasses)
    }
  },

  getAllClasses: (): Class[] => {
    return classesStorage.getAll()
  },

  deleteUser: (userId: string, userType: "student" | "teacher"): void => {
    if (userType === "student") {
      const students = userStorage.getStudents()
      const filteredStudents = students.filter((s) => s.id !== userId)
      storage.set(STORAGE_KEYS.STUDENTS, filteredStudents)
    } else if (userType === "teacher") {
      const teachers = userStorage.getTeachers()
      const filteredTeachers = teachers.filter((t) => t.id !== userId)
      storage.set(STORAGE_KEYS.TEACHERS, filteredTeachers)
    }
  },
}
