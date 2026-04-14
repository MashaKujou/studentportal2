'use server'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
  status: 'present' | 'absent' | 'late' | 'excused'
  subject: string
  createdAt: string
}

export interface Request {
  id: string
  studentId: string
  type: string
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'read' | 'in_progress'
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
  getGrades: async (studentId: string): Promise<Grade[]> => {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching grades:', error)
      return []
    }
    return data || []
  },

  // Attendance operations
  getAttendance: async (studentId: string): Promise<Attendance[]> => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching attendance:', error)
      return []
    }
    return data || []
  },

  // Request operations
  getRequests: async (studentId: string): Promise<Request[]> => {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching requests:', error)
      return []
    }
    return data || []
  },

  createRequest: async (request: Omit<Request, 'id' | 'createdAt'>): Promise<Request | null> => {
    const { data, error } = await supabase
      .from('requests')
      .insert([request])
      .select()

    if (error) {
      console.error('Error creating request:', error)
      return null
    }
    return data?.[0] || null
  },

  // Schedule operations
  getSchedule: async (studentId: string): Promise<Schedule[]> => {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching schedule:', error)
      return []
    }
    return data || []
  },

  // Document operations
  getDocuments: async (studentId: string): Promise<Document[]> => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('student_id', studentId)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
      return []
    }
    return data || []
  },

  uploadDocument: async (document: Omit<Document, 'id' | 'uploadedAt'>): Promise<Document | null> => {
    const { data, error } = await supabase
      .from('documents')
      .insert([document])
      .select()

    if (error) {
      console.error('Error uploading document:', error)
      return null
    }
    return data?.[0] || null
  },

  deleteDocument: async (documentId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (error) {
      console.error('Error deleting document:', error)
      return false
    }
    return true
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
