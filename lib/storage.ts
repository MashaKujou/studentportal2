import { STORAGE_KEYS } from "./constants"

interface StorageService {
  get<T>(key: string): T | null
  set<T>(key: string, data: T): void
  remove(key: string): void
  clear(): void
  getAllKeys(): string[]
}

const createStorageService = (): StorageService => {
  return {
    get: <T,>(key: string): T | null => {
      try {
        const item = typeof window !== "undefined" ? localStorage.getItem(key) : null
        return item ? JSON.parse(item) : null
      } catch (error) {
        console.error(`Error retrieving ${key} from storage:`, error)
        return null
      }
    },

    set: <T,>(key: string, data: T): void => {
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(key, JSON.stringify(data))
        }
      } catch (error) {
        console.error(`Error storing ${key} to storage:`, error)
      }
    },

    remove: (key: string): void => {
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem(key)
        }
      } catch (error) {
        console.error(`Error removing ${key} from storage:`, error)
      }
    },

    clear: (): void => {
      try {
        if (typeof window !== "undefined") {
          localStorage.clear()
        }
      } catch (error) {
        console.error("Error clearing storage:", error)
      }
    },

    getAllKeys: (): string[] => {
      try {
        if (typeof window !== "undefined") {
          return Object.keys(localStorage)
        }
        return []
      } catch (error) {
        console.error("Error getting storage keys:", error)
        return []
      }
    },
  }
}

export const storage = createStorageService()

export interface Student {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  studentId: string
  academicLevel: "senior_high" | "diploma" | "bachelor"
  grade?: string // For senior high (11 or 12)
  strand?: string // For senior high
  year?: string // For college (1-3 for diploma, 1-4 for bachelor)
  course?: string // For college (DIT, DIC, BTVTED, BSMA)
  status: "pending" | "approved" | "rejected" | "suspended"
  registeredAt: string
  approvedAt?: string
  approvedBy?: string
  avatar?: string
  profilePicture?: string
  lastPasswordChange?: string
}

export interface Teacher {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  teacherId: string
  department: string
  subjects: string[]
  status: "active" | "inactive"
  registeredAt: string
  avatar?: string
}

export interface Admin {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: "super_admin" | "admin"
  permissions: string[]
  status: "active" | "inactive"
  registeredAt: string
}

export interface Subject {
  id: string
  code: string
  name: string
  time: string
  day: string
  unit: string
  credits?: number
  createdAt: string
}

export interface Class {
  id: string
  subjectId: string
  subjectCode: string
  subjectName: string
  teacherId: string
  teacherName: string
  time: string
  day: string
  semester: string
  year: string
  students: string[]
  createdAt: string
}

export interface RequestMessage {
  id: string
  requestId: string
  senderId: string
  senderRole: "student" | "admin"
  message: string
  createdAt: string
}

export interface Grade {
  id: string
  studentId: string
  classId: string
  subjectCode: string
  subjectName: string
  teacherId: string
  teacherName: string
  semester: "1st Semester" | "2nd Semester"
  term: "Prelim" | "Midterm" | "Finals"
  score: number
  status: "draft" | "submitted" | "approved" | "rejected"
  submittedAt?: string
  approvedAt?: string
  approvedBy?: string
  rejectedReason?: string
  createdAt: string
}

export interface FinancialFeeAssignment {
  id: string
  title: string
  description?: string
  academicLevel: "senior_high" | "diploma" | "bachelor"
  targetName: string
  targetType: "strand" | "course"
  gradeOrYear: string
  amount: number
  dueDate?: string
  createdAt: string
}

export const userStorage = {
  getStudents: (): Student[] => {
    return storage.get<Student[]>(STORAGE_KEYS.STUDENTS) || []
  },

  addStudent: (student: Student): void => {
    const allStudents = userStorage.getStudents()
    const teachers = userStorage.getTeachers()
    const admins = userStorage.getAdmins()

    if (allStudents.find((s) => s.email === student.email)) {
      throw new Error("This email is already registered as a student account")
    }
    if (teachers.find((t) => t.email === student.email)) {
      throw new Error("This email is already registered as a teacher account")
    }
    if (admins.find((a) => a.email === student.email)) {
      throw new Error("This email is already registered as an admin account")
    }

    allStudents.push(student)
    storage.set(STORAGE_KEYS.STUDENTS, allStudents)
  },

  updateStudent: (id: string, updates: Partial<Student>): void => {
    const students = userStorage.getStudents()
    const index = students.findIndex((s) => s.id === id)
    if (index !== -1) {
      students[index] = { ...students[index], ...updates }
      storage.set(STORAGE_KEYS.STUDENTS, students)
    }
  },

  getTeachers: (): Teacher[] => {
    return storage.get<Teacher[]>(STORAGE_KEYS.TEACHERS) || []
  },

  addTeacher: (teacher: Teacher): void => {
    const teachers = userStorage.getTeachers()
    const students = userStorage.getStudents()
    const admins = userStorage.getAdmins()

    if (students.find((s) => s.email === teacher.email)) {
      throw new Error("This email is already registered as a student account")
    }
    if (teachers.find((t) => t.email === teacher.email)) {
      throw new Error("This email is already registered as a teacher account")
    }
    if (admins.find((a) => a.email === teacher.email)) {
      throw new Error("This email is already registered as an admin account")
    }

    teachers.push(teacher)
    storage.set(STORAGE_KEYS.TEACHERS, teachers)
  },

  updateTeacher: (id: string, updates: Partial<Teacher>): void => {
    const teachers = userStorage.getTeachers()
    const index = teachers.findIndex((t) => t.id === id)
    if (index !== -1) {
      teachers[index] = { ...teachers[index], ...updates }
      storage.set(STORAGE_KEYS.TEACHERS, teachers)
    }
  },

  getAdmins: (): Admin[] => {
    return storage.get<Admin[]>(STORAGE_KEYS.ADMINS) || []
  },

  addAdmin: (admin: Admin): void => {
    const admins = userStorage.getAdmins()
    const students = userStorage.getStudents()
    const teachers = userStorage.getTeachers()

    if (students.find((s) => s.email === admin.email)) {
      throw new Error("This email is already registered as a student account")
    }
    if (teachers.find((t) => t.email === admin.email)) {
      throw new Error("This email is already registered as a teacher account")
    }
    if (admins.find((a) => a.email === admin.email)) {
      throw new Error("This email is already registered as an admin account")
    }

    admins.push(admin)
    storage.set(STORAGE_KEYS.ADMINS, admins)
  },

  deleteAdmin: (id: string): void => {
    const admins = userStorage.getAdmins()
    const filtered = admins.filter((a) => a.id !== id)
    storage.set(STORAGE_KEYS.ADMINS, filtered)
  },

  findUserByEmail: (email: string): Student | Teacher | Admin | null => {
    const students = userStorage.getStudents()
    if (students.find((s) => s.email === email)) {
      return students.find((s) => s.email === email)!
    }

    const teachers = userStorage.getTeachers()
    if (teachers.find((t) => t.email === email)) {
      return teachers.find((t) => t.email === email)!
    }

    const admins = userStorage.getAdmins()
    if (admins.find((a) => a.email === email)) {
      return admins.find((a) => a.email === email)!
    }

    return null
  },
}

export const collegeCoursesStorage = {
  getAll: (): { diplomaCourses: string[]; bachelorCourses: string[] } => {
    return (
      storage.get("college_courses") || {
        diplomaCourses: ["DIT", "DHRT", "DHRT (SCHOLAR)"],
        bachelorCourses: ["BTVTED", "BSMA", "BSE"],
      }
    )
  },

  update: (diplomaCourses: string[], bachelorCourses: string[]): void => {
    storage.set("college_courses", { diplomaCourses, bachelorCourses })
  },

  addDiplomaCourse: (course: string): void => {
    const courses = collegeCoursesStorage.getAll()
    if (!courses.diplomaCourses.includes(course)) {
      courses.diplomaCourses.push(course)
      storage.set("college_courses", courses)
    }
  },

  removeDiplomaCourse: (course: string): void => {
    const courses = collegeCoursesStorage.getAll()
    courses.diplomaCourses = courses.diplomaCourses.filter((c) => c !== course)
    storage.set("college_courses", courses)
  },

  addBachelorCourse: (course: string): void => {
    const courses = collegeCoursesStorage.getAll()
    if (!courses.bachelorCourses.includes(course)) {
      courses.bachelorCourses.push(course)
      storage.set("college_courses", courses)
    }
  },

  removeBachelorCourse: (course: string): void => {
    const courses = collegeCoursesStorage.getAll()
    courses.bachelorCourses = courses.bachelorCourses.filter((c) => c !== course)
    storage.set("college_courses", courses)
  },
}

const generateId = (prefix: string): string => {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`
}

export const subjectStorage = {
  getAll: (): Subject[] => {
    return storage.get<Subject[]>("subjects") || []
  },

  add: (subject: Omit<Subject, "id" | "createdAt">): Subject => {
    const newSubject: Subject = {
      ...subject,
      id: generateId("SUB"),
      createdAt: new Date().toISOString(),
    }
    const subjects = subjectStorage.getAll()
    subjects.push(newSubject)
    storage.set("subjects", subjects)
    return newSubject
  },

  getByCode: (code: string): Subject | undefined => {
    return subjectStorage.getAll().find((s) => s.code === code)
  },

  delete: (id: string): void => {
    const subjects = subjectStorage.getAll()
    storage.set(
      "subjects",
      subjects.filter((s) => s.id !== id),
    )
  },
}

export const classesStorage = {
  getAll: (): Class[] => {
    return storage.get<Class[]>("classes") || []
  },

  add: (classItem: Omit<Class, "id" | "createdAt">): Class => {
    const newClass: Class = {
      ...classItem,
      id: generateId("CLS"),
      createdAt: new Date().toISOString(),
    }
    const classes = classesStorage.getAll()
    classes.push(newClass)
    storage.set("classes", classes)
    return newClass
  },

  getByTeacherId: (teacherId: string): Class[] => {
    return classesStorage.getAll().filter((c) => c.teacherId === teacherId)
  },

  delete: (id: string): void => {
    const classes = classesStorage.getAll()
    storage.set(
      "classes",
      classes.filter((c) => c.id !== id),
    )
  },
}

export const requestMessagesStorage = {
  getByRequestId: (requestId: string): RequestMessage[] => {
    const messages = storage.get<RequestMessage[]>("request_messages") || []
    return messages.filter((m) => m.requestId === requestId)
  },

  add: (message: Omit<RequestMessage, "id" | "createdAt">): RequestMessage => {
    const newMessage: RequestMessage = {
      ...message,
      id: generateId("MSG"),
      createdAt: new Date().toISOString(),
    }
    const messages = storage.get<RequestMessage[]>("request_messages") || []
    messages.push(newMessage)
    storage.set("request_messages", messages)
    return newMessage
  },
}

export const gradesStorage = {
  getAll: (): Grade[] => {
    return storage.get<Grade[]>(STORAGE_KEYS.GRADES) || []
  },

  add: (grade: Omit<Grade, "id" | "createdAt">): Grade => {
    const newGrade: Grade = {
      ...grade,
      id: generateId("GRD"),
      createdAt: new Date().toISOString(),
    }
    const grades = gradesStorage.getAll()
    grades.push(newGrade)
    storage.set(STORAGE_KEYS.GRADES, grades)
    return newGrade
  },

  update: (id: string, updates: Partial<Grade>): void => {
    const grades = gradesStorage.getAll()
    const index = grades.findIndex((g) => g.id === id)
    if (index !== -1) {
      grades[index] = { ...grades[index], ...updates }
      storage.set(STORAGE_KEYS.GRADES, grades)
    }
  },

  getByStudentId: (studentId: string): Grade[] => {
    return gradesStorage.getAll().filter((g) => g.studentId === studentId)
  },

  getByClassId: (classId: string): Grade[] => {
    return gradesStorage.getAll().filter((g) => g.classId === classId)
  },

  getByTeacherId: (teacherId: string): Grade[] => {
    return gradesStorage.getAll().filter((g) => g.teacherId === teacherId)
  },

  getPendingApproval: (): Grade[] => {
    return gradesStorage.getAll().filter((g) => g.status === "submitted")
  },

  delete: (id: string): void => {
    const grades = gradesStorage.getAll()
    storage.set(
      STORAGE_KEYS.GRADES,
      grades.filter((g) => g.id !== id),
    )
  },
}

const matchesFeeAssignment = (student: Student, assignment: FinancialFeeAssignment): boolean => {
  if (student.status !== "approved") {
    return false
  }

  if (student.academicLevel !== assignment.academicLevel) {
    return false
  }

  if (assignment.academicLevel === "senior_high") {
    return student.grade === assignment.gradeOrYear && student.strand === assignment.targetName
  }

  return student.year === assignment.gradeOrYear && student.course === assignment.targetName
}

export const financialStorage = {
  getAll: (): FinancialFeeAssignment[] => {
    return storage.get<FinancialFeeAssignment[]>(STORAGE_KEYS.FINANCIAL_RECORDS) || []
  },

  add: (assignment: Omit<FinancialFeeAssignment, "id" | "createdAt">): FinancialFeeAssignment => {
    const newAssignment: FinancialFeeAssignment = {
      ...assignment,
      id: generateId("FEE"),
      createdAt: new Date().toISOString(),
    }

    const assignments = financialStorage.getAll()
    assignments.push(newAssignment)
    storage.set(STORAGE_KEYS.FINANCIAL_RECORDS, assignments)
    return newAssignment
  },

  update: (id: string, updates: Partial<FinancialFeeAssignment>): void => {
    const assignments = financialStorage.getAll()
    const index = assignments.findIndex((assignment) => assignment.id === id)

    if (index !== -1) {
      assignments[index] = { ...assignments[index], ...updates }
      storage.set(STORAGE_KEYS.FINANCIAL_RECORDS, assignments)
    }
  },

  delete: (id: string): void => {
    const assignments = financialStorage.getAll()
    storage.set(
      STORAGE_KEYS.FINANCIAL_RECORDS,
      assignments.filter((assignment) => assignment.id !== id),
    )
  },

  getByStudentId: (studentId: string): FinancialFeeAssignment[] => {
    const student = userStorage.getStudents().find((item) => item.id === studentId)

    if (!student) {
      return []
    }

    return financialStorage.getAll().filter((assignment) => matchesFeeAssignment(student, assignment))
  },

  getStudentsForAssignment: (assignment: FinancialFeeAssignment): Student[] => {
    return userStorage.getStudents().filter((student) => matchesFeeAssignment(student, assignment))
  },
}
