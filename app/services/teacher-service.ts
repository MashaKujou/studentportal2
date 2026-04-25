import { STORAGE_KEYS } from "@/lib/constants"
import { storage, classesStorage, courseSubjectsStorage, subjectStorage, userStorage } from "@/lib/storage"
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

export interface TeacherAssignedClass {
  id: string
  subjectId: string
  subjectCode: string
  subjectName: string
  teacherId: string
  teacherName: string
  academicLevel: "senior_high" | "diploma" | "bachelor"
  courseOrStrand: string
  yearOrGrade: string
  day: string
  time: string
  students: string[]
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

  getMyClasses: (teacherId: string): TeacherAssignedClass[] => {
    const buckets = courseSubjectsStorage.getAll()
    const subjects = subjectStorage.getAll()
    const subjectById = new Map(subjects.map((s) => [s.id, s]))
    const students = userStorage.getStudents()
    const teacher = userStorage.getTeachers().find((t) => t.id === teacherId)
    const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}`.trim() : "Unknown Teacher"

    const matchesBucket = (student: any, bucket: any) => {
      if (student.status !== "approved") return false
      if (bucket.academicLevel === "senior_high") {
        return (
          student.academicLevel === "senior_high" &&
          student.strand === bucket.courseOrStrand &&
          student.grade === bucket.yearOrGrade
        )
      }
      return (
        student.academicLevel === bucket.academicLevel &&
        student.course === bucket.courseOrStrand &&
        student.year === bucket.yearOrGrade
      )
    }

    const rows: TeacherAssignedClass[] = []
    buckets.forEach((bucket) => {
      const assignments = bucket.subjectAssignments || bucket.subjectIds.map((subjectId) => ({ subjectId, teacherId: "" }))
      assignments
        .filter((a) => a.teacherId === teacherId)
        .forEach((a) => {
          const subject = subjectById.get(a.subjectId)
          if (!subject) return
          const bucketStudents = students.filter((s) => matchesBucket(s, bucket)).map((s) => s.id)

          rows.push({
            id: `${bucket.id}:${subject.id}`,
            subjectId: subject.id,
            subjectCode: subject.code,
            subjectName: subject.name,
            teacherId,
            teacherName,
            academicLevel: bucket.academicLevel,
            courseOrStrand: bucket.courseOrStrand,
            yearOrGrade: bucket.yearOrGrade,
            day: subject.day,
            time: subject.time,
            students: bucketStudents,
          })
        })
    })

    return rows
  },

  getTeacherAnalytics: (teacherId: string) => {
    const classes = teacherService.getMyClasses(teacherId)
    const classIds = new Set(classes.map((c) => c.id))
    const allGrades = storage.get<any[]>(STORAGE_KEYS.GRADES) || []
    const teacherGrades = allGrades.filter((g) => g.teacherId === teacherId || classIds.has(g.classId))

    const analytics = {
      totalClasses: classes.length,
      totalStudents: classes.reduce((sum, c) => sum + c.students.length, 0),
      gradesEntered: teacherGrades.length,
      averageGrade: 0,
    }

    if (teacherGrades.length > 0) {
      const avg = teacherGrades.reduce((sum, g: any) => sum + (g.score || 0), 0) / teacherGrades.length
      analytics.averageGrade = Math.round(avg * 100) / 100
    }

    return analytics
  },

  getClassStudents: (classId: string) => {
    const [bucketId, subjectId] = classId.split(":")
    const bucket = courseSubjectsStorage.getAll().find((b) => b.id === bucketId)
    if (!bucket || !subjectId) return []
    const students = userStorage.getStudents()
    if (bucket.academicLevel === "senior_high") {
      return students.filter(
        (s) =>
          s.status === "approved" &&
          s.academicLevel === "senior_high" &&
          s.strand === bucket.courseOrStrand &&
          s.grade === bucket.yearOrGrade,
      )
    }
    return students.filter(
      (s) =>
        s.status === "approved" &&
        s.academicLevel === bucket.academicLevel &&
        s.course === bucket.courseOrStrand &&
        s.year === bucket.yearOrGrade,
    )
  },
}
