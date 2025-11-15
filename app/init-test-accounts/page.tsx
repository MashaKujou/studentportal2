"use client"

import { useState, useEffect } from "react"
import { userStorage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { generateId } from "@/lib/helpers"

export default function InitTestAccounts() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const admins = userStorage.getAdmins()
    setIsInitialized(admins.length > 0)
  }, [])

  const initializeTestAccounts = () => {
    try {
      // Admin Account
      const admin = {
        id: generateId(),
        email: "admin@test.com",
        password: "Admin123!",
        firstName: "Admin",
        lastName: "User",
        role: "super_admin" as const,
        permissions: ["manage_users", "approve_registrations", "manage_courses"],
        status: "active" as const,
        registeredAt: new Date().toISOString(),
      }

      // Teacher Account
      const teacher = {
        id: generateId(),
        email: "teacher@test.com",
        password: "Teacher123!",
        firstName: "John",
        lastName: "Instructor",
        teacherId: "T001",
        department: "Information Technology",
        subjects: ["Web Development", "Database"],
        status: "active" as const,
        registeredAt: new Date().toISOString(),
      }

      // Senior High Student
      const senioreHighStudent = {
        id: generateId(),
        email: "student_senior@test.com",
        password: "Student123!",
        firstName: "Maria",
        lastName: "Student",
        studentId: "S001",
        academicLevel: "senior_high" as const,
        grade: "12",
        strand: "STEM",
        status: "approved" as const,
        registeredAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        approvedBy: "admin@test.com",
      }

      // Diploma Student
      const diplomaStudent = {
        id: generateId(),
        email: "student_diploma@test.com",
        password: "Student123!",
        firstName: "Juan",
        lastName: "Diploma",
        studentId: "S002",
        academicLevel: "diploma" as const,
        year: "2",
        course: "DIT",
        status: "approved" as const,
        registeredAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        approvedBy: "admin@test.com",
      }

      // Bachelor Student
      const bachelorStudent = {
        id: generateId(),
        email: "student_bachelor@test.com",
        password: "Student123!",
        firstName: "Ana",
        lastName: "Bachelor",
        studentId: "S003",
        academicLevel: "bachelor" as const,
        year: "3",
        course: "BTVTED",
        status: "approved" as const,
        registeredAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        approvedBy: "admin@test.com",
      }

      userStorage.addAdmin(admin)
      userStorage.addTeacher(teacher)
      userStorage.addStudent(senioreHighStudent)
      userStorage.addStudent(diplomaStudent)
      userStorage.addStudent(bachelorStudent)

      setMessage("Test accounts initialized successfully!")
      setIsInitialized(true)
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const clearAllData = () => {
    if (window.confirm("Are you sure? This will clear ALL data.")) {
      localStorage.clear()
      setMessage("All data cleared!")
      setIsInitialized(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test Accounts Setup</CardTitle>
          <CardDescription>Initialize demo accounts for testing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isInitialized ? (
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-semibold text-green-900 dark:text-green-100 mb-4">Test Accounts Ready:</p>
              <div className="space-y-2 text-sm text-green-800 dark:text-green-200 font-mono">
                <p>Admin: admin@test.com / Admin123!</p>
                <p>Teacher: teacher@test.com / Teacher123!</p>
                <p>Student (SHS): student_senior@test.com / Student123!</p>
                <p>Student (Diploma): student_diploma@test.com / Student123!</p>
                <p>Student (Bachelor): student_bachelor@test.com / Student123!</p>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                No test accounts found. Click the button below to initialize them.
              </p>
            </div>
          )}

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${message.includes("successfully") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {message}
            </div>
          )}

          <div className="space-y-3">
            <Button onClick={initializeTestAccounts} className="w-full">
              Initialize Test Accounts
            </Button>
            <Button onClick={clearAllData} variant="outline" className="w-full bg-transparent">
              Clear All Data
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Go to <strong>/login</strong> to login with any test account
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
