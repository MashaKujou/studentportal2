'use server'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  academicLevel: string
  strand?: string
  program?: string
  year?: string
  status: 'approved' | 'pending' | 'rejected'
  approvedAt?: string
  approvedBy?: string
  profilePicture?: string
  createdAt: string
}

export interface Teacher {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  specialty: string
  status: 'active' | 'inactive'
  profilePicture?: string
  createdAt: string
}

export interface Subject {
  id: string
  code: string
  name: string
  time: string
  day: string
  unit: string
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

export const adminService = {
  // Student management
  getAllStudents: async (): Promise<Student[]> => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('first_name', { ascending: true })

    if (error) {
      console.error('Error fetching students:', error)
      return []
    }
    return data || []
  },

  getPendingStudents: async (): Promise<Student[]> => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending students:', error)
      return []
    }
    return data || []
  },

  approveStudent: async (studentId: string): Promise<Student | null> => {
    const { data, error } = await supabase
      .from('students')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: 'admin',
      })
      .eq('id', studentId)
      .select()

    if (error) {
      console.error('Error approving student:', error)
      return null
    }
    return data?.[0] || null
  },

  rejectStudent: async (studentId: string): Promise<Student | null> => {
    const { data, error } = await supabase
      .from('students')
      .update({ status: 'rejected' })
      .eq('id', studentId)
      .select()

    if (error) {
      console.error('Error rejecting student:', error)
      return null
    }
    return data?.[0] || null
  },

  deleteStudent: async (studentId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId)

    if (error) {
      console.error('Error deleting student:', error)
      return false
    }
    return true
  },

  // Teacher management
  getAllTeachers: async (): Promise<Teacher[]> => {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('first_name', { ascending: true })

    if (error) {
      console.error('Error fetching teachers:', error)
      return []
    }
    return data || []
  },

  deleteTeacher: async (teacherId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', teacherId)

    if (error) {
      console.error('Error deleting teacher:', error)
      return false
    }
    return true
  },

  // System statistics
  getSystemStatistics: async () => {
    const [students, teachers, classes, subjects] = await Promise.all([
      adminService.getAllStudents(),
      adminService.getAllTeachers(),
      adminService.getAllClasses(),
      adminService.getAllSubjects(),
    ])

    return {
      totalStudents: students.length,
      approvedStudents: students.filter((s) => s.status === 'approved').length,
      pendingStudents: students.filter((s) => s.status === 'pending').length,
      totalTeachers: teachers.length,
      activeTeachers: teachers.filter((t) => t.status === 'active').length,
      totalClasses: classes.length,
      totalSubjects: subjects.length,
    }
  },

  // Subject management
  createSubject: async (code: string, name: string, time: string, day: string, unit: string): Promise<Subject | null> => {
    const { data, error } = await supabase
      .from('subjects')
      .insert([{ code, name, time, day, unit }])
      .select()

    if (error) {
      console.error('Error creating subject:', error)
      return null
    }
    return data?.[0] || null
  },

  getAllSubjects: async (): Promise<Subject[]> => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('code', { ascending: true })

    if (error) {
      console.error('Error fetching subjects:', error)
      return []
    }
    return data || []
  },

  deleteSubject: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting subject:', error)
      return false
    }
    return true
  },

  // Class management
  addClass: async (subjectCode: string, teacherId: string, semester: string, year: string): Promise<Class | null> => {
    const [subjects, teachers] = await Promise.all([
      adminService.getAllSubjects(),
      adminService.getAllTeachers(),
    ])

    const subject = subjects.find((s) => s.code === subjectCode)
    const teacher = teachers.find((t) => t.id === teacherId)

    if (!subject || !teacher) {
      console.error('Subject or teacher not found')
      return null
    }

    const { data, error } = await supabase
      .from('classes')
      .insert([
        {
          subject_id: subject.id,
          subject_code: subject.code,
          subject_name: subject.name,
          teacher_id: teacherId,
          teacher_name: `${teacher.firstName} ${teacher.lastName}`,
          time: subject.time,
          day: subject.day,
          semester,
          year,
          students: [],
        },
      ])
      .select()

    if (error) {
      console.error('Error adding class:', error)
      return null
    }
    return data?.[0] || null
  },

  getAllClasses: async (): Promise<Class[]> => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching classes:', error)
      return []
    }
    return data || []
  },

  bulkEnrollStudents: async (classId: string, studentIds: string[]): Promise<boolean> => {
    const { data: classData, error: fetchError } = await supabase
      .from('classes')
      .select('students')
      .eq('id', classId)
      .single()

    if (fetchError) {
      console.error('Error fetching class:', fetchError)
      return false
    }

    const existingStudents = new Set(classData?.students || [])
    studentIds.forEach((id) => existingStudents.add(id))

    const { error } = await supabase
      .from('classes')
      .update({ students: Array.from(existingStudents) })
      .eq('id', classId)

    if (error) {
      console.error('Error enrolling students:', error)
      return false
    }
    return true
  },
}
