// File upload validation utilities

export const ALLOWED_FILE_TYPES = {
  DOCUMENTS: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  IMAGES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  SPREADSHEETS: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  PRESENTATIONS: [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
} as const

export const MAX_FILE_SIZES = {
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  IMAGE: 5 * 1024 * 1024, // 5MB
  VIDEO: 100 * 1024 * 1024, // 100MB
} as const

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export const validateFileType = (file: File, allowedTypes: readonly string[]): FileValidationResult => {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    }
  }
  return { valid: true }
}

export const validateFileSize = (file: File, maxSize: number): FileValidationResult => {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
    }
  }
  return { valid: true }
}

export const validateFile = (file: File, allowedTypes: readonly string[], maxSize: number): FileValidationResult => {
  const typeValidation = validateFileType(file, allowedTypes)
  if (!typeValidation.valid) return typeValidation

  const sizeValidation = validateFileSize(file, maxSize)
  if (!sizeValidation.valid) return sizeValidation

  return { valid: true }
}

export const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || ""
}

export const isImageFile = (file: File): boolean => {
  return ALLOWED_FILE_TYPES.IMAGES.includes(file.type)
}

export const isDocumentFile = (file: File): boolean => {
  return ALLOWED_FILE_TYPES.DOCUMENTS.includes(file.type)
}
