"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/app/contexts/auth-context"
import { validateRegistrationForm } from "@/lib/validation"
import Link from "next/link"
import {
  SENIOR_HIGH_GRADES,
  SENIOR_HIGH_STRANDS,
  DIPLOMA_YEARS,
  BACHELOR_YEARS,
  DEFAULT_DIPLOMA_COURSES,
  DEFAULT_BACHELOR_COURSES,
} from "@/lib/constants"
import { collegeCoursesStorage } from "@/lib/storage"

export const RegisterForm = () => {
  const router = useRouter()
  const { registerStudent } = useAuth()
  const [academicLevel, setAcademicLevel] = useState<"senior_high" | "diploma" | "bachelor">("senior_high")
  const [diplomaCourses, setDiplomaCourses] = useState<string[]>(DEFAULT_DIPLOMA_COURSES)
  const [bachelorCourses, setBachelorCourses] = useState<string[]>(DEFAULT_BACHELOR_COURSES)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    studentId: "",
    grade: "",
    strand: "",
    year: "",
    course: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Load college courses on mount
  React.useEffect(() => {
    const courses = collegeCoursesStorage.getAll()
    setDiplomaCourses(courses.diplomaCourses)
    setBachelorCourses(courses.bachelorCourses)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const validation = validateRegistrationForm({
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      firstName: formData.firstName,
      lastName: formData.lastName,
    })

    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    if (!formData.studentId) {
      setErrors({ form: "Student ID is required" })
      return
    }

    // Validate academic level specific fields
    if (academicLevel === "senior_high") {
      if (!formData.grade || !formData.strand) {
        setErrors({ form: "Grade and Strand are required for Senior High" })
        return
      }
    } else if (academicLevel === "diploma") {
      if (!formData.year || !formData.course) {
        setErrors({ form: "Year and Course are required for Diploma" })
        return
      }
    } else if (academicLevel === "bachelor") {
      if (!formData.year || !formData.course) {
        setErrors({ form: "Year and Course are required for Bachelor" })
        return
      }
    }

    setIsLoading(true)
    try {
      await registerStudent({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        studentId: formData.studentId,
        academicLevel,
        grade: formData.grade || undefined,
        strand: formData.strand || undefined,
        year: formData.year || undefined,
        course: formData.course || undefined,
      })

      router.push("/pending-approval")
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Registration failed" })
    } finally {
      setIsLoading(false)
    }
  }

  const getYearOptions = () => {
    if (academicLevel === "diploma") {
      return DIPLOMA_YEARS
    }
    return BACHELOR_YEARS
  }

  const getCourseOptions = () => {
    if (academicLevel === "diploma") {
      return diplomaCourses
    }
    return bachelorCourses
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Student Registration</CardTitle>
        <CardDescription>Create a new student account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
          {/* Academic Level Selection */}
          <div>
            <label htmlFor="academicLevel" className="block text-sm font-medium mb-2">
              Choose Academic Level
            </label>
            <select
              id="academicLevel"
              value={academicLevel}
              onChange={(e) => setAcademicLevel(e.target.value as any)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="senior_high">Senior High School</option>
              <option value="diploma">Diploma (College - 3 Years)</option>
              <option value="bachelor">Bachelor (College - 4 Years)</option>
            </select>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                First Name
              </label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                Last Name
              </label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
          </div>

          <div>
            <label htmlFor="studentId" className="block text-sm font-medium mb-2">
              Student ID
            </label>
            <Input
              id="studentId"
              name="studentId"
              placeholder="Student ID"
              value={formData.studentId}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {/* Senior High School Fields */}
          {academicLevel === "senior_high" && (
            <>
              <div>
                <label htmlFor="grade" className="block text-sm font-medium mb-2">
                  Grade Level
                </label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  disabled={isLoading}
                >
                  <option value="">Select Grade</option>
                  {SENIOR_HIGH_GRADES.map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="strand" className="block text-sm font-medium mb-2">
                  Strand
                </label>
                <select
                  id="strand"
                  name="strand"
                  value={formData.strand}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  disabled={isLoading}
                >
                  <option value="">Select Strand</option>
                  {SENIOR_HIGH_STRANDS.map((strand) => (
                    <option key={strand} value={strand}>
                      {strand}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* College Fields (Diploma or Bachelor) */}
          {(academicLevel === "diploma" || academicLevel === "bachelor") && (
            <>
              <div>
                <label htmlFor="year" className="block text-sm font-medium mb-2">
                  Year Level
                </label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  disabled={isLoading}
                >
                  <option value="">Select Year</option>
                  {getYearOptions().map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="course" className="block text-sm font-medium mb-2">
                  Course
                </label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  disabled={isLoading}
                >
                  <option value="">Select Course</option>
                  {getCourseOptions().map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {errors.form && (
            <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-md text-sm">
              {errors.form}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>

          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
