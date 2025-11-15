// School constants and static configurations
export const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
} as const

export const ACADEMIC_LEVELS = {
  SENIOR_HIGH: "senior_high",
  DIPLOMA: "diploma",
  BACHELOR: "bachelor",
} as const

export const SENIOR_HIGH_GRADES = ["11", "12"] as const

export const DIPLOMA_YEARS = ["1", "2", "3"] as const

export const BACHELOR_YEARS = ["1", "2", "3", "4"] as const

export const DEFAULT_DIPLOMA_COURSES = ["DIT", "DIC"] as const

export const DEFAULT_BACHELOR_COURSES = ["BTVTED", "BSMA"] as const

export const SENIOR_HIGH_STRANDS = ["STEM", "ABM", "HUMSS", "GAS", "HE", "ICT", "Sports", "Arts and Design"] as const

export const STUDENT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
} as const

export const REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed",
} as const

export const GRADE_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const

export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
  EXCUSED: "excused",
} as const

export const GRADING_SCALE = {
  A: { min: 90, max: 100, gpa: 4.0 },
  B: { min: 80, max: 89, gpa: 3.0 },
  C: { min: 70, max: 79, gpa: 2.0 },
  D: { min: 60, max: 69, gpa: 1.0 },
  F: { min: 0, max: 59, gpa: 0.0 },
} as const

export const GRADING_TERMS = ["Prelim", "Midterm", "PreFinals", "Finals"] as const

export const REQUEST_TYPES = [
  "Transcript",
  "Certificate",
  "Transfer Certificate",
  "Leave Letter",
  "Identity Card",
  "Admission Letter",
  "Other",
] as const

export const REQUEST_TYPES_COLLEGE = [
  "Transcript of Records (TOR)",
  "Certificate of Enrollment",
  "Certificate of Good Moral Character",
  "Diploma Copy",
  "Clearance",
  "Recommendation Letter",
  "Grade Sheet",
  "Transfer Credential",
] as const

export const INQUIRY_CATEGORIES = ["General", "Academic", "Administrative", "Technical", "Financial", "Other"] as const

export const REQUEST_MESSAGE_STATUSES = {
  PENDING: "pending",
  READ: "read",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  REJECTED: "rejected",
} as const

export const STORAGE_KEYS = {
  STUDENTS: "student_portal_students",
  TEACHERS: "student_portal_teachers",
  ADMINS: "student_portal_admins",
  AUTH_USER: "student_portal_auth_user",
  GRADES: "student_portal_grades",
  ATTENDANCE: "student_portal_attendance",
  REQUESTS: "student_portal_requests",
  MESSAGES: "student_portal_messages",
  NOTIFICATIONS: "student_portal_notifications",
  SCHEDULES: "student_portal_schedules",
  DOCUMENTS: "student_portal_documents",
} as const

export const PAGINATION = {
  ITEMS_PER_PAGE: 10,
  MAX_ITEMS_PER_PAGE: 50,
} as const
