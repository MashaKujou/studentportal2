"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type User = any & { role: string }

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
      // Check students table
      const { data: students, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("email", email)

      if (!studentError && students && students.length > 0) {
        const student = students[0]
        // Note: In production, use proper password hashing (bcrypt)
        if (student.password === password) {
          const authenticatedUser = { ...student, role: "student" }
          setUser(authenticatedUser as User)
          sessionStorage.setItem("auth_user", JSON.stringify(authenticatedUser))
          return
        }
      }

      // Check teachers table
      const { data: teachers, error: teacherError } = await supabase
        .from("teachers")
        .select("*")
        .eq("email", email)

      if (!teacherError && teachers && teachers.length > 0) {
        const teacher = teachers[0]
        if (teacher.password === password) {
          const authenticatedUser = { ...teacher, role: "teacher" }
          setUser(authenticatedUser as User)
          sessionStorage.setItem("auth_user", JSON.stringify(authenticatedUser))
          return
        }
      }

      // Check admins table
      const { data: admins, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email)

      if (!adminError && admins && admins.length > 0) {
        const admin = admins[0]
        if (admin.password === password) {
          const authenticatedUser = { ...admin, role: "admin" }
          setUser(authenticatedUser as User)
          sessionStorage.setItem("auth_user", JSON.stringify(authenticatedUser))
          return
        }
      }

      throw new Error("Invalid email or password")
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
      const { error } = await supabase
        .from("students")
        .insert([
          {
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            password: data.password, // Note: Hash this in production
            phone: data.phone || "",
            date_of_birth: data.dateOfBirth || "",
            gender: data.gender || "",
            academic_level: data.academicLevel,
            strand: data.strand || null,
            program: data.program || null,
            year: data.year || null,
            status: "pending",
          },
        ])

      if (error) throw error
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
      const { error } = await supabase
        .from("teachers")
        .insert([
          {
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            password: data.password, // Note: Hash this in production
            phone: data.phone || "",
            department: data.department,
            specialty: data.specialty || "",
            status: "active",
          },
        ])

      if (error) throw error
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
      const { error } = await supabase
        .from("admins")
        .insert([
          {
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            password: data.password, // Note: Hash this in production
            role: "admin",
            status: "active",
          },
        ])

      if (error) throw error
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
