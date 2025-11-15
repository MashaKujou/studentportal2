"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type Student, type Teacher, type Admin, userStorage } from "@/lib/storage"

type User = (Student | Teacher | Admin) & { role: string }

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  registerStudent: (data: any) => Promise<void>
  registerTeacher: (data: any) => Promise<void>
  registerAdmin: (data: any) => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("auth_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Check all user types to find matching credentials
      const students = userStorage.getStudents()
      const student = students.find((s) => s.email === email && s.password === password)

      if (student) {
        const authenticatedUser = { ...student, role: "student" }
        setUser(authenticatedUser as User)
        localStorage.setItem("auth_user", JSON.stringify(authenticatedUser))
        return
      }

      const teachers = userStorage.getTeachers()
      const teacher = teachers.find((t) => t.email === email && t.password === password)

      if (teacher) {
        const authenticatedUser = { ...teacher, role: "teacher" }
        setUser(authenticatedUser as User)
        localStorage.setItem("auth_user", JSON.stringify(authenticatedUser))
        return
      }

      const admins = userStorage.getAdmins()
      const admin = admins.find((a) => a.email === email && a.password === password)

      if (admin) {
        const authenticatedUser = { ...admin, role: "admin" }
        setUser(authenticatedUser as User)
        localStorage.setItem("auth_user", JSON.stringify(authenticatedUser))
        return
      }

      throw new Error("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_user")
  }

  const registerStudent = async (data: any) => {
    setIsLoading(true)
    try {
      const newStudent: Student = {
        id: `STU${Date.now()}`,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        studentId: data.studentId,
        academicLevel: data.academicLevel,
        grade: data.grade || undefined,
        strand: data.strand || undefined,
        year: data.year || undefined,
        course: data.course || undefined,
        status: "pending",
        registeredAt: new Date().toISOString(),
      }

      userStorage.addStudent(newStudent)
    } finally {
      setIsLoading(false)
    }
  }

  const registerTeacher = async (data: any) => {
    setIsLoading(true)
    try {
      const newTeacher: Teacher = {
        id: `TCH${Date.now()}`,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        teacherId: data.teacherId,
        department: data.department,
        subjects: data.subjects || [],
        status: "active",
        registeredAt: new Date().toISOString(),
      }

      userStorage.addTeacher(newTeacher)
    } finally {
      setIsLoading(false)
    }
  }

  const registerAdmin = async (data: any) => {
    setIsLoading(true)
    try {
      const newAdmin: Admin = {
        id: `ADM${Date.now()}`,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "admin",
        permissions: ["all"],
        status: "active",
        registeredAt: new Date().toISOString(),
      }

      userStorage.addAdmin(newAdmin)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        registerStudent,
        registerTeacher,
        registerAdmin,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
