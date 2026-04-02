"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

// Use anon key for normal operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Use service role key for login (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
      
      // Use service role to bypass RLS during login
      const { data: usersData, error: usersError } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("email", email)

      console.log("[v0] Users query result:", { found: usersData?.length, error: usersError?.message })

      if (usersError || !usersData || usersData.length === 0) {
        console.log("[v0] User not found")
        throw new Error("Invalid email or password")
      }

      const userData = usersData[0]
      console.log("[v0] User data retrieved, checking password")

      // Check password
      if (userData.password_hash !== password) {
        console.log("[v0] Password does not match")
        throw new Error("Invalid email or password")
      }

      console.log("[v0] Password verified, fetching role data")

      // Fetch role-specific data based on role
      let roleData = null
      if (userData.role === "student") {
        const { data: studentData, error: studentError } = await supabaseAdmin
          .from("students")
          .select("*")
          .eq("user_id", userData.id)
          .single()
        roleData = studentData
        if (studentError) console.log("[v0] Student data error:", studentError.message)
      } else if (userData.role === "teacher") {
        const { data: teacherData, error: teacherError } = await supabaseAdmin
          .from("teachers")
          .select("*")
          .eq("user_id", userData.id)
          .single()
        roleData = teacherData
        if (teacherError) console.log("[v0] Teacher data error:", teacherError.message)
      } else if (userData.role === "admin") {
        const { data: adminData, error: adminError } = await supabaseAdmin
          .from("admins")
          .select("*")
          .eq("user_id", userData.id)
          .single()
        roleData = adminData
        if (adminError) console.log("[v0] Admin data error:", adminError.message)
      }

      // Build authenticated user object
      const authenticatedUser = {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role,
        status: userData.status,
        profilePictureUrl: userData.profile_picture_url,
        ...(roleData && { roleData }),
      }

      console.log("[v0] Login successful for:", email, "Role:", userData.role)
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
