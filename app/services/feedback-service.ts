import { STORAGE_KEYS } from "@/lib/constants"
import { storage } from "@/lib/storage"

export interface Feedback {
  id: string
  studentId: string
  category: "bug" | "feature_request" | "general" | "complaint" | "suggestion"
  subject: string
  message: string
  status: "new" | "reviewing" | "resolved" | "closed" | "rejected"
  priority: "low" | "medium" | "high"
  attachments?: string[]
  adminResponse?: string
  respondedAt?: string
  respondedBy?: string
  createdAt: string
  updatedAt: string
}

export const feedbackService = {
  // Student methods
  getStudentFeedback: (studentId: string): Feedback[] => {
    const feedbacks = storage.get<Feedback[]>(STORAGE_KEYS.FEEDBACK) || []
    return feedbacks.filter((f) => f.studentId === studentId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  submitFeedback: (feedback: Omit<Feedback, "id" | "createdAt" | "updatedAt" | "status">): Feedback => {
    const feedbacks = storage.get<Feedback[]>(STORAGE_KEYS.FEEDBACK) || []

    const newFeedback: Feedback = {
      ...feedback,
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    feedbacks.push(newFeedback)
    storage.set(STORAGE_KEYS.FEEDBACK, feedbacks)
    return newFeedback
  },

  updateFeedback: (id: string, updates: Partial<Feedback>): Feedback | null => {
    const feedbacks = storage.get<Feedback[]>(STORAGE_KEYS.FEEDBACK) || []
    const feedback = feedbacks.find((f) => f.id === id)
    if (!feedback) return null

    Object.assign(feedback, updates, { updatedAt: new Date().toISOString() })
    storage.set(STORAGE_KEYS.FEEDBACK, feedbacks)
    return feedback
  },

  // Admin methods
  getAllFeedback: (): Feedback[] => {
    return storage.get<Feedback[]>(STORAGE_KEYS.FEEDBACK) || []
  },

  getFeedbackById: (id: string): Feedback | null => {
    const feedbacks = feedbackService.getAllFeedback()
    return feedbacks.find((f) => f.id === id) || null
  },

  updateStatus: (id: string, status: Feedback["status"]): Feedback | null => {
    return feedbackService.updateFeedback(id, {
      status,
      updatedAt: new Date().toISOString(),
    })
  },

  addResponse: (id: string, response: string, respondedBy: string): Feedback | null => {
    return feedbackService.updateFeedback(id, {
      adminResponse: response,
      respondedAt: new Date().toISOString(),
      respondedBy,
      status: "resolved",
    })
  },

  deleteFeedback: (id: string): void => {
    const feedbacks = storage.get<Feedback[]>(STORAGE_KEYS.FEEDBACK) || []
    const filtered = feedbacks.filter((f) => f.id !== id)
    storage.set(STORAGE_KEYS.FEEDBACK, filtered)
  },

  // Analytics
  getFeedbackStats: () => {
    const feedbacks = feedbackService.getAllFeedback()

    const categoryCounts = feedbacks.reduce(
      (acc, f) => {
        acc[f.category] = (acc[f.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const statusCounts = feedbacks.reduce(
      (acc, f) => {
        acc[f.status] = (acc[f.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      totalFeedback: feedbacks.length,
      byCategory: categoryCounts,
      byStatus: statusCounts,
      averageResolutionTime: feedbacks.filter((f) => f.respondedAt).length,
    }
  },

  getFeedbackByCategory: (category: string): Feedback[] => {
    const feedbacks = feedbackService.getAllFeedback()
    return feedbacks.filter((f) => f.category === category)
  },

  getFeedbackByStatus: (status: string): Feedback[] => {
    const feedbacks = feedbackService.getAllFeedback()
    return feedbacks.filter((f) => f.status === status)
  },
}
