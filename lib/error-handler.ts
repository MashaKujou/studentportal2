// Error handling utilities

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode = 400,
    public details?: any,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export interface ErrorResponse {
  message: string
  statusCode: number
  details?: any
  timestamp: string
}

export const handleError = (error: unknown): ErrorResponse => {
  const timestamp = new Date().toISOString()

  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      timestamp,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
      timestamp,
    }
  }

  return {
    message: "An unexpected error occurred",
    statusCode: 500,
    timestamp,
  }
}

export const createErrorResponse = (message: string, statusCode = 400, details?: any): ErrorResponse => {
  return {
    message,
    statusCode,
    details,
    timestamp: new Date().toISOString(),
  }
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return "An unexpected error occurred"
}
