import { storage } from "@/lib/storage"
import { STORAGE_KEYS, GRADE_STATUS, ATTENDANCE_STATUS } from "@/lib/constants"
import { Student, Teacher } from "@/lib/storage"

export interface Analytics {
  totalStudents: number
  approvedStudents: number
  pendingStudents: number
  studentsByLevel: Record<string, number>
  studentsByStatus: Record<string, number>
  totalGrades: number
  gradesByStatus: Record<string, number>
  averageAttendanceRate: number
  attendanceByStatus: Record<string, number>
}

export const analyticsService = {
  getStudentAnalytics: (): Analytics => {
    const students = storage.get<Student[]>(STORAGE_KEYS.STUDENTS) || []
    const grades = storage.get<any[]>(STORAGE_KEYS.GRADES) || []
    const attendance = storage.get<any[]>(STORAGE_KEYS.ATTENDANCE) || []

    const studentsByLevel = students.reduce(
      (acc, s) => {
        const level = s.academicLevel || "unknown"
        acc[level] = (acc[level] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const studentsByStatus = students.reduce(
      (acc, s) => {
        acc[s.status] = (acc[s.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const gradesByStatus = grades.reduce(
      (acc, g) => {
        const status = g.status || "unknown"
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const attendanceByStatus = attendance.reduce(
      (acc, a) => {
        const status = a.status || "unknown"
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const presentCount = attendanceByStatus["present"] || 0
    const totalAttendance = Object.values(attendanceByStatus).reduce((sum, val) => sum + val, 0)
    const averageAttendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

    return {
      totalStudents: students.length,
      approvedStudents: studentsByStatus["approved"] || 0,
      pendingStudents: studentsByStatus["pending"] || 0,
      studentsByLevel,
      studentsByStatus,
      totalGrades: grades.length,
      gradesByStatus,
      averageAttendanceRate,
      attendanceByStatus,
    }
  },

  getFinancialAnalytics: () => {
    const financialRecords = storage.get<any[]>(STORAGE_KEYS.FINANCIAL_RECORDS) || []
    const students = storage.get<Student[]>(STORAGE_KEYS.STUDENTS) || []

    const totalTuition = financialRecords
      .filter((r) => r.type === "tuition")
      .reduce((sum, r) => sum + r.amount, 0)

    const totalFees = financialRecords
      .filter((r) => r.type === "fee")
      .reduce((sum, r) => sum + r.amount, 0)

    const totalPaid = financialRecords
      .filter((r) => r.type === "payment")
      .reduce((sum, r) => sum + r.amount, 0)

    const balanceOwed = totalTuition + totalFees - totalPaid

    const paymentsByMethod = financialRecords
      .filter((r) => r.type === "payment")
      .reduce(
        (acc, r) => {
          const method = r.paymentMethod || "unknown"
          acc[method] = (acc[method] || 0) + r.amount
          return acc
        },
        {} as Record<string, number>
      )

    const statusCounts = financialRecords.reduce(
      (acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      totalTuition,
      totalFees,
      totalPaid,
      balanceOwed,
      collectionRate: totalTuition + totalFees > 0 ? Math.round((totalPaid / (totalTuition + totalFees)) * 100) : 0,
      paymentsByMethod,
      statusCounts,
    }
  },

  getLibraryAnalytics: () => {
    const books = storage.get<any[]>(STORAGE_KEYS.LIBRARY_CATALOG) || []
    const checkouts = storage.get<any[]>(STORAGE_KEYS.LIBRARY_CHECKOUTS) || []

    const activeCheckouts = checkouts.filter((c) => c.status === "active").length
    const overdueCheckouts = checkouts.filter((c) => {
      const today = new Date()
      const dueDate = new Date(c.dueDate)
      return c.status === "active" && today > dueDate
    }).length

    const totalCopies = books.reduce((sum, b) => sum + b.copies, 0)
    const availableCopies = books.reduce((sum, b) => sum + b.availableCopies, 0)

    const booksByCategory = books.reduce(
      (acc, b) => {
        const cat = b.category || "Other"
        acc[cat] = (acc[cat] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      totalBooks: books.length,
      totalCopies,
      availableCopies,
      borrowedCopies: totalCopies - availableCopies,
      activeCheckouts,
      overdueCheckouts,
      booksByCategory,
      utilizationRate:
        totalCopies > 0 ? Math.round(((totalCopies - availableCopies) / totalCopies) * 100) : 0,
    }
  },

  getCampusAnalytics: () => {
    const facilities = storage.get<any[]>(STORAGE_KEYS.CAMPUS_RESOURCES) || []
    const bookings = storage.get<any[]>("campus_bookings") || []

    const facilityTypes = facilities.reduce(
      (acc, f) => {
        const type = f.type || "other"
        acc[type] = (acc[type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const bookingsByStatus = bookings.reduce(
      (acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const availableFacilities = facilities.filter((f) => f.availability === "available").length

    return {
      totalFacilities: facilities.length,
      availableFacilities,
      maintenanceFacilities: facilities.filter((f) => f.availability === "maintenance").length,
      facilityTypes,
      totalBookings: bookings.length,
      approvedBookings: bookingsByStatus["approved"] || 0,
      pendingBookings: bookingsByStatus["pending"] || 0,
      bookingsByStatus,
    }
  },

  getFeedbackAnalytics: () => {
    const feedback = storage.get<any[]>(STORAGE_KEYS.FEEDBACK) || []

    const byCategory = feedback.reduce(
      (acc, f) => {
        acc[f.category] = (acc[f.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const byStatus = feedback.reduce(
      (acc, f) => {
        acc[f.status] = (acc[f.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const byPriority = feedback.reduce(
      (acc, f) => {
        acc[f.priority || "medium"] = (acc[f.priority || "medium"] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const respondedCount = feedback.filter((f) => f.adminResponse).length

    return {
      totalFeedback: feedback.length,
      newFeedback: byStatus["new"] || 0,
      reviewingFeedback: byStatus["reviewing"] || 0,
      resolvedFeedback: byStatus["resolved"] || 0,
      respondedCount,
      responseRate: feedback.length > 0 ? Math.round((respondedCount / feedback.length) * 100) : 0,
      byCategory,
      byStatus,
      byPriority,
    }
  },

  getSystemAnalytics: () => {
    const students = storage.get<Student[]>(STORAGE_KEYS.STUDENTS) || []
    const teachers = storage.get<Teacher[]>(STORAGE_KEYS.TEACHERS) || []
    const messages = storage.get<any[]>(STORAGE_KEYS.MESSAGES) || []
    const notifications = storage.get<any[]>(STORAGE_KEYS.NOTIFICATIONS) || []

    const unreadMessages = messages.filter((m) => m.status === "pending" || m.status === "unread").length
    const unreadNotifications = notifications.filter((n) => n.status === "unread").length

    return {
      totalUsers: students.length + teachers.length,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalMessages: messages.length,
      unreadMessages,
      totalNotifications: notifications.length,
      unreadNotifications,
      systemHealth: "Operational",
    }
  },
}
