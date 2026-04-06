"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

// Use anon key for normal operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type User = any & { role: string }

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
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
    const initAuth = async () => {
      try {
        const storedUser = sessionStorage.getItem("auth_user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        sessionStorage.removeItem("auth_user")
      } finally {
        setIsLoading(false)
      }
    }
    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Import storage utilities
      const { userStorage } = await import("@/lib/storage")

      // Try to find user in different roles
      const admins = userStorage.getAdmins()
      const teachers = userStorage.getTeachers()
      const students = userStorage.getStudents()

      let foundUser: any = null
      let role: string | null = null

      // Check admins
      const admin = admins.find((a: any) => a.email === email && a.password === password)
      if (admin) {
        foundUser = admin
        role = admin.role || "admin"
      }

      // Check teachers
      if (!foundUser) {
        const teacher = teachers.find((t: any) => t.email === email && t.password === password)
        if (teacher) {
          foundUser = teacher
          role = "teacher"
        }
      }

      // Check students
      if (!foundUser) {
        const student = students.find((s: any) => s.email === email && s.password === password)
        if (student) {
          foundUser = student
          role = "student"
        }
      }

      if (!foundUser) {
        throw new Error("Invalid email or password")
      }

      // Store user with role in sessionStorage
      const userToStore = {
        ...foundUser,
        role: role,
      }

      sessionStorage.setItem("auth_user", JSON.stringify(userToStore))
      setUser(userToStore)
      
      return userToStore
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem("auth_user")
  }

  const registerStudent = async (data: any) => {
    setIsLoading(true)
    try {
      // First create user in users table
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert([
          {
            email: data.email,
            password_hash: data.password,
            full_name: `${data.firstName} ${data.lastName}`,
            role: "student",
            status: "active",
          },
        ])
        .select()

      if (userError) throw userError

      const userId = newUser?.[0]?.id
      if (!userId) throw new Error("Failed to create user")

      // Then create student record
      const { error: studentError } = await supabase
        .from("students")
        .insert([
          {
            user_id: userId,
            academic_level: data.academicLevel,
            strand: data.strand || null,
            program: data.program || null,
            year: data.year || null,
            enrollment_status: "pending",
          },
        ])

      if (studentError) throw studentError
    } catch (error) {
      console.error("Student registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const registerTeacher = async (data: any) => {
    setIsLoading(true)
    try {
      // First create user in users table
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert([
          {
            email: data.email,
            password_hash: data.password,
            full_name: `${data.firstName} ${data.lastName}`,
            role: "teacher",
            status: "active",
          },
        ])
        .select()

      if (userError) throw userError

      const userId = newUser?.[0]?.id
      if (!userId) throw new Error("Failed to create user")

      // Then create teacher record
      const { error: teacherError } = await supabase
        .from("teachers")
        .insert([
          {
            user_id: userId,
            department: data.department,
            specialization: data.specialty || null,
          },
        ])

      if (teacherError) throw teacherError
    } catch (error) {
      console.error("Teacher registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const registerAdmin = async (data: any) => {
    setIsLoading(true)
    try {
      // First create user in users table
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert([
          {
            email: data.email,
            password_hash: data.password,
            full_name: `${data.firstName} ${data.lastName}`,
            role: "admin",
            status: "active",
          },
        ])
        .select()

      if (userError) throw userError

      const userId = newUser?.[0]?.id
      if (!userId) throw new Error("Failed to create user")

      // Then create admin record
      const { error: adminError } = await supabase
        .from("admins")
        .insert([
          {
            user_id: userId,
            permission_level: "full_access",
          },
        ])

      if (adminError) throw adminError
    } catch (error) {
      console.error("Admin registration error:", error)
      throw error
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
