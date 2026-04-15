"use client"

import React, { useState } from "react"
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

  const [academicLevel, setAcademicLevel] =
    useState<"senior_high" | "diploma" | "bachelor">("senior_high")

  const [diplomaCourses, setDiplomaCourses] = useState<string[]>(DEFAULT_DIPLOMA_COURSES)
  const [bachelorCourses, setBachelorCourses] = useState<string[]>(DEFAULT_BACHELOR_COURSES)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    middleName: "",
    lastName: "",
    studentId: "",
    grade: "",
    strand: "",
    year: "",
    course: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  React.useEffect(() => {
    const courses = collegeCoursesStorage.getAll()
    setDiplomaCourses(courses.diplomaCourses)
    setBachelorCourses(courses.bachelorCourses)
  }, [])

  // ---------------- HANDLE CHANGE ----------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    // ✅ AUTO FORMAT STUDENT ID (####-##-###)
    if (name === "studentId") {
      let digits = value.replace(/\D/g, "") // remove non-numbers

      if (digits.length > 9) {
        digits = digits.slice(0, 9)
      }

      let formatted = digits

      if (digits.length > 4) {
        formatted = digits.slice(0, 4) + "-" + digits.slice(4)
      }

      if (digits.length > 6) {
        formatted =
          digits.slice(0, 4) +
          "-" +
          digits.slice(4, 6) +
          "-" +
          digits.slice(6)
      }

      setFormData((prev) => ({ ...prev, studentId: formatted }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // ---------------- VALIDATORS ----------------
  const nameRegex = /^[A-Za-z\s]+$/
  const studentIdRegex = /^\d{4}-\d{2}-\d{3}$/
  const emailRegex = /^[A-Za-z0-9@._!]+$/

  const validateNames = () => {
    if (formData.firstName && !nameRegex.test(formData.firstName)) {
      return "First Name must not contain numbers or symbols"
    }
    if (formData.middleName && !nameRegex.test(formData.middleName)) {
      return "Middle Name must not contain numbers or symbols"
    }
    if (formData.lastName && !nameRegex.test(formData.lastName)) {
      return "Last Name must not contain numbers or symbols"
    }
    return null
  }

  const validateStudentId = () => {
    if (!studentIdRegex.test(formData.studentId)) {
      return "Student ID must follow format ####-##-###"
    }
    return null
  }

  const validateEmailFormat = () => {
    if (!emailRegex.test(formData.email)) {
      return "Email contains invalid characters (no quotes or commas allowed)"
    }

    if (
      formData.email.includes('"') ||
      formData.email.includes("'") ||
      formData.email.includes(",")
    ) {
      return "Email cannot contain quotes or commas"
    }

    return null
  }

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const validation = validateRegistrationForm({
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
    })

    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    const nameError = validateNames()
    if (nameError) {
      setErrors({ form: nameError })
      return
    }

    const studentIdError = validateStudentId()
    if (studentIdError) {
      setErrors({ form: studentIdError })
      return
    }

    const emailError = validateEmailFormat()
    if (emailError) {
      setErrors({ form: emailError })
      return
    }

    if (!formData.studentId) {
      setErrors({ form: "Student ID is required" })
      return
    }

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
        middleName: formData.middleName,
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
      setErrors({
        form: err instanceof Error ? err.message : "Registration failed",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getYearOptions = () => {
    return academicLevel === "diploma"
      ? DIPLOMA_YEARS
      : BACHELOR_YEARS
  }

  const getCourseOptions = () => {
    return academicLevel === "diploma"
      ? diplomaCourses
      : bachelorCourses
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Student Registration</CardTitle>
        <CardDescription>Create a new student account</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">

          {/* Academic Level */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Choose Academic Level
            </label>
            <select
              value={academicLevel}
              onChange={(e) => setAcademicLevel(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="senior_high">Senior High School</option>
              <option value="diploma">Diploma (College - 3 Years)</option>
              <option value="bachelor">Bachelor (College - 4 Years)</option>
            </select>
          </div>

          {/* Names */}
          <div className="grid grid-cols-3 gap-2">
            <Input name="firstName" placeholder="First Name" onChange={handleChange} />
            <Input name="middleName" placeholder="Middle Name" onChange={handleChange} />
            <Input name="lastName" placeholder="Last Name" onChange={handleChange} />
          </div>

          <Input name="email" placeholder="Email" onChange={handleChange} />
          <Input name="password" type="password" placeholder="Password" onChange={handleChange} />
          <Input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} />

          {/* Student ID (AUTO FORMAT) */}
          <Input
            name="studentId"
            placeholder="1234-56-789"
            value={formData.studentId}
            onChange={handleChange}
            maxLength={11}
          />

          {/* Senior High */}
          {academicLevel === "senior_high" && (
            <>
              <select name="grade" onChange={handleChange}>
                <option value="">Select Grade</option>
                {SENIOR_HIGH_GRADES.map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>

              <select name="strand" onChange={handleChange}>
                <option value="">Select Strand</option>
                {SENIOR_HIGH_STRANDS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </>
          )}

          {/* College */}
          {(academicLevel === "diploma" || academicLevel === "bachelor") && (
            <>
              <select name="year" onChange={handleChange}>
                <option value="">Select Year</option>
                {getYearOptions().map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>

              <select name="course" onChange={handleChange}>
                <option value="">Select Course</option>
                {getCourseOptions().map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </>
          )}

          {errors.form && (
            <p className="text-red-500 text-sm">{errors.form}</p>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Registering..." : "Register"}
          </Button>

          <p className="text-center text-sm">
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}