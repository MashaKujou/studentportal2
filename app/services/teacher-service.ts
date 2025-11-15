import { STORAGE_KEYS } from "@/lib/constants"
import { storage, classesStorage, userStorage } from "@/lib/storage"
import { generateId } from "@/lib/helpers"

export interface Class {
  id: string
  teacherId: string
  name: string
  grade: string
  studentCount: number
  subject: string
  createdAt: string
}

export interface ClassGrade {
  id: string
  teacherId: string
  classId: string
  studentId: string
  score: number
  term: string
  semester: string
  status: "draft" | "submitted" | "approved" | "rejected"
  submittedAt?: string
  createdAt: string
}

export interface Material {
  id: string
  teacherId: string
  classId: string
  title: string
  url: string
  type: string
  uploadedAt: string
}

export const teacherService = {
  // Class operations
  getClasses: (teacherId: string): Class[] => {
    const classes = storage.get<Class[]>(STORAGE_KEYS.SCHEDULES) || []
    return (classes as any).filter((c: any) => c.teacherId === teacherId)
  },

  addClass: (classData: Omit<Class, "id" | "createdAt">): Class => {
    const newClass: Class = {
      ...classData,
      id: generateId("CLS"),
      createdAt: new Date().toISOString(),
    }
    const classes = storage.get<Class[]>(STORAGE_KEYS.SCHEDULES) || []
    classes.push(newClass as any)
    storage.set(STORAGE_KEYS.SCHEDULES, classes)
    return newClass
  },

  // Grade operations
  getGradesByClass: (classId: string): ClassGrade[] => {
    const grades = storage.get<ClassGrade[]>("teacher_grades") || []
    return grades.filter((g) => g.classId === classId)
  },

  submitGrade: (grade: Omit<ClassGrade, "id" | "createdAt" | "submittedAt">): ClassGrade => {
    const newGrade: ClassGrade = {
      ...grade,
      id: generateId("TGRDE"),
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    }
    const grades = storage.get<ClassGrade[]>("teacher_grades") || []
    grades.push(newGrade)
    storage.set("teacher_grades", grades)
    return newGrade
  },

  // Material operations
  getMaterials: (classId: string): Material[] => {
    const materials = storage.get<Material[]>("teacher_materials") || []
    return materials.filter((m) => m.classId === classId)
  },

  uploadMaterial: (material: Omit<Material, "id" | "uploadedAt">): Material => {
    const newMaterial: Material = {
      ...material,
      id: generateId("MAT"),
      uploadedAt: new Date().toISOString(),
    }
    const materials = storage.get<Material[]>("teacher_materials") || []
    materials.push(newMaterial)
    storage.set("teacher_materials", materials)
    return newMaterial
  },

  getMyClasses: (teacherId: string) => {
    return classesStorage.getByTeacherId(teacherId)
  },

  getTeacherAnalytics: (teacherId: string) => {
    const classes = classesStorage.getByTeacherId(teacherId)
    const allGrades = storage.get<any[]>(STORAGE_KEYS.GRADES) || []

    const analytics = {
      totalClasses: classes.length,
      totalStudents: classes.reduce((sum, c) => sum + c.students.length, 0),
      gradesEntered: allGrades.length,
      averageGrade: 0,
    }

    if (allGrades.length > 0) {
      const avg = allGrades.reduce((sum, g: any) => sum + (g.score || 0), 0) / allGrades.length
      analytics.averageGrade = Math.round(avg * 100) / 100
    }

    return analytics
  },

  getClassStudents: (classId: string) => {
    const classes = classesStorage.getAll()
    const classItem = classes.find((c) => c.id === classId)
    if (!classItem) return []

    const students = userStorage.getStudents()
    return students.filter((s) => classItem.students.includes(s.id))
  },

  recordAttendance: (classId: string, attendanceData: any): void => {
    const attendance = storage.get<any[]>(STORAGE_KEYS.ATTENDANCE) || []
    attendance.push({
      ...attendanceData,
      id: generateId("ATT"),
      classId,
      createdAt: new Date().toISOString(),
    })
    storage.set(STORAGE_KEYS.ATTENDANCE, attendance)
  },
}
