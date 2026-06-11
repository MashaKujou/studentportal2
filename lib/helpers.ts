// General helper utilities

export const generateId = (prefix = ""): string => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const getGradeFromScore = (score: number): string => {
  if (score >= 90) return "A"
  if (score >= 80) return "B"
  if (score >= 70) return "C"
  if (score >= 60) return "D"
  return "F"
}

export const calculateGPA = (grades: number[]): number => {
  if (grades.length === 0) return 0

  const gpaValues = grades.map((score) => {
    if (score >= 90) return 4.0
    if (score >= 80) return 3.0
    if (score >= 70) return 2.0
    if (score >= 60) return 1.0
    return 0.0
  })

  return gpaValues.reduce((a, b) => a + b, 0) / gpaValues.length
}

export const calculateAttendancePercentage = (present: number, total: number): number => {
  if (total === 0) return 0
  return (present / total) * 100
}

export const sortByDate = (items: any[], dateField: string, ascending = false) => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a[dateField]).getTime()
    const dateB = new Date(b[dateField]).getTime()
    return ascending ? dateA - dateB : dateB - dateA
  })
}

export const filterByStatus = (items: any[], status: string, statusField = "status") => {
  return items.filter((item) => item[statusField] === status)
}

export const searchInArray = (items: any[], query: string, searchFields: string[]): any[] => {
  const lowerQuery = query.toLowerCase()
  return items.filter((item) => searchFields.some((field) => String(item[field]).toLowerCase().includes(lowerQuery)))
}

export const groupByField = (items: any[], field: string): Record<string, any[]> => {
  return items.reduce(
    (acc, item) => {
      const key = item[field]
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    },
    {} as Record<string, any[]>,
  )
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === "string") return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === "object") return Object.keys(value).length === 0
  return false
}
