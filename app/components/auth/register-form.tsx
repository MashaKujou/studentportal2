"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/app/contexts/auth-context"
import { validateRegistrationForm } from "@/lib/validation"
import Link from "next/link"
import Image from "next/image"
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

  const [diplomaCourses, setDiplomaCourses] = useState<string[]>([])
  const [bachelorCourses, setBachelorCourses] = useState<string[]>([])

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

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
  const nameRegex = /^[A-Za-z]+(?:[\s-][A-Za-z]+)*$/
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
    <div className="relative min-h-screen w-full flex items-center justify-center">

      {/* Full-page blurred background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/background.png"
          alt="Background"
          fill
          className="object-cover blur-sm scale-105"
          priority
        />
        {/* Dark overlay so the card stands out */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <Card className="w-full shadow-2xl">
          <CardHeader className="items-center pb-2">
            <div className="flex justify-center mb-4">
              <Image
                src="/header.png"
                alt="Logo"
                width={160}
                height={80}
                className="object-contain"
                priority
              />
            </div>
            <CardTitle className="text-center">Student Registration</CardTitle>
            <CardDescription className="text-center">Create a new student account</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">

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
                <div>
                  <label className="block text-xs font-medium mb-1">First</label>
                  <Input name="firstName" placeholder="First Name" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Middle</label>
                  <Input name="middleName" placeholder="Middle Name" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Last</label>
                  <Input name="lastName" placeholder="Last Name" onChange={handleChange} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input name="email" placeholder="Email" onChange={handleChange} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Input name="password" type={showPassword ? "text" : "password"} placeholder="Password" onChange={handleChange} />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <Input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" onChange={handleChange} />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Student ID</label>
                <Input
                  name="studentId"
                  placeholder="1234-56-789"
                  value={formData.studentId}
                  onChange={handleChange}
                  maxLength={11}
                />
              </div>

              {/* Senior High */}
              {academicLevel === "senior_high" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Grade</label>
                    <select name="grade" onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                      <option value="">Select Grade</option>
                      {SENIOR_HIGH_GRADES.map((g) => (
                        <option key={g} value={g}>Grade {g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Strand</label>
                    <select name="strand" onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                      <option value="">Select Strand</option>
                      {SENIOR_HIGH_STRANDS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* College */}
              {(academicLevel === "diploma" || academicLevel === "bachelor") && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Year</label>
                    <select name="year" onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                      <option value="">Select Year</option>
                      {getYearOptions().map((y) => (
                        <option key={y} value={y}>Year {y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Course</label>
                    <select name="course" onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
                      <option value="">Select Course</option>
                      {getCourseOptions().map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {errors.form && (
                <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-md text-sm">
                  {errors.form}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-11 font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? "Registering..." : "Register"}
              </Button>

              <div className="text-center space-y-2 text-sm pt-2">
                <p>
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}