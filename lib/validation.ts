// Form validation utilities

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(email)
  return {
    valid: isValid,
    error: isValid ? undefined : "Invalid email address"
  }
}

export const validatePassword = (password: string): { valid: boolean; errors: string[]; error?: string } => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  return {
    valid: errors.length === 0,
    errors,
    error: errors.length > 0 ? errors[0] : undefined
  }
}

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s]?[0-9]{3}[-\s]?[0-9]{4,6}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50
}

export const validateStudentId = (id: string): boolean => {
  return id.trim().length >= 5 && id.trim().length <= 20
}

export const validateGrade = (grade: number): boolean => {
  return grade >= 0 && grade <= 100
}

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export const validateRegistrationForm = (data: {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  middleName: string
  lastName: string
}): ValidationResult => {
  const errors: Record<string, string> = {}

  const emailValidation = validateEmail(data.email)
  if (!emailValidation.valid) {
    errors.email = emailValidation.error
  }

  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match"
  }

  if (!validateName(data.firstName)) {
    errors.firstName = "First name must be 2-50 characters"
  }

  if (data.middleName && !validateName(data.middleName)) {
    errors.middleName = "Middle name must be 2-50 characters"
  }

  if (!validateName(data.lastName)) {
    errors.lastName = "Last name must be 2-50 characters"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateLoginForm = (data: {
  email: string
  password: string
}): ValidationResult => {
  const errors: Record<string, string> = {}

  if (!data.email) {
    errors.email = "Email is required"
  } else {
    const emailValidation = validateEmail(data.email)
    if (!emailValidation.valid) {
      errors.email = emailValidation.error
    }
  }

  if (!data.password) {
    errors.password = "Password is required"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
