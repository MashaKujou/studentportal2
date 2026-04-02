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
      console.log("[v0] Login attempt for:", email)
      
      // Query the users table with join to get role and related data
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select(`
          *,
          students(*),
          teachers(*),
          admins(*)
        `)
        .eq("email", email)
        .single()

      console.log("[v0] User query result:", { userData, userError })

      if (userError || !userData) {
        console.log("[v0] User not found:", userError?.message)
        throw new Error("Invalid email or password")
      }

      // Check password
      if (userData.password_hash !== password) {
        console.log("[v0] Password mismatch for:", email)
        throw new Error("Invalid email or password")
      }

      console.log("[v0] Login successful for:", email, "Role:", userData.role)

      // Build authenticated user object with all related data
      const authenticatedUser = {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role,
        status: userData.status,
        profilePictureUrl: userData.profile_picture_url,
        ...(userData.students?.[0] && { student: userData.students[0] }),
        ...(userData.teachers?.[0] && { teacher: userData.teachers[0] }),
        ...(userData.admins?.[0] && { admin: userData.admins[0] }),
      }

      setUser(authenticatedUser as User)
      sessionStorage.setItem("auth_user", JSON.stringify(authenticatedUser))
      return
    } catch (error) {
      console.error("[v0] Login error:", error)
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
