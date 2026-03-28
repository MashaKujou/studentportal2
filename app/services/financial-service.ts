import { STORAGE_KEYS } from "@/lib/constants"
import { storage } from "@/lib/storage"

export interface FinancialRecord {
  id: string
  studentId: string
  type: "tuition" | "fee" | "payment" | "adjustment"
  description: string
  amount: number
  status: "paid" | "partial" | "unpaid" | "overdue"
  dueDate: string
  paidDate?: string
  paymentMethod?: "cash" | "check" | "bank_transfer" | "online" | "installment"
  receipt?: string
  createdAt: string
  remarks?: string
}

export interface FinancialSummary {
  studentId: string
  totalTuition: number
  totalFees: number
  totalPaid: number
  balanceOwed: number
  lastPaymentDate?: string
}

export const financialService = {
  // Student-facing methods
  getStudentFinancialRecords: (studentId: string): FinancialRecord[] => {
    const records = storage.get<FinancialRecord[]>(STORAGE_KEYS.FINANCIAL_RECORDS) || []
    return records.filter((r) => r.studentId === studentId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getFinancialSummary: (studentId: string): FinancialSummary => {
    const records = financialService.getStudentFinancialRecords(studentId)
    
    const tuitionRecords = records.filter((r) => r.type === "tuition")
    const feeRecords = records.filter((r) => r.type === "fee")
    const paymentRecords = records.filter((r) => r.type === "payment")

    const totalTuition = tuitionRecords.reduce((sum, r) => sum + (r.type === "tuition" ? r.amount : 0), 0)
    const totalFees = feeRecords.reduce((sum, r) => sum + r.amount, 0)
    const totalPaid = paymentRecords.reduce((sum, r) => sum + r.amount, 0)
    const balanceOwed = totalTuition + totalFees - totalPaid

    const lastPayment = paymentRecords[0]

    return {
      studentId,
      totalTuition,
      totalFees,
      totalPaid,
      balanceOwed,
      lastPaymentDate: lastPayment?.paidDate,
    }
  },

  // Admin methods
  getAllFinancialRecords: (): FinancialRecord[] => {
    return storage.get<FinancialRecord[]>(STORAGE_KEYS.FINANCIAL_RECORDS) || []
  },

  addFinancialRecord: (record: Omit<FinancialRecord, "id" | "createdAt">): FinancialRecord => {
    const records = storage.get<FinancialRecord[]>(STORAGE_KEYS.FINANCIAL_RECORDS) || []
    const newRecord: FinancialRecord = {
      ...record,
      id: `fin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }
    records.push(newRecord)
    storage.set(STORAGE_KEYS.FINANCIAL_RECORDS, records)
    return newRecord
  },

  updateFinancialRecord: (id: string, updates: Partial<FinancialRecord>): FinancialRecord | null => {
    const records = storage.get<FinancialRecord[]>(STORAGE_KEYS.FINANCIAL_RECORDS) || []
    const record = records.find((r) => r.id === id)
    if (!record) return null

    Object.assign(record, updates)
    storage.set(STORAGE_KEYS.FINANCIAL_RECORDS, records)
    return record
  },

  deleteFinancialRecord: (id: string): void => {
    const records = storage.get<FinancialRecord[]>(STORAGE_KEYS.FINANCIAL_RECORDS) || []
    const filtered = records.filter((r) => r.id !== id)
    storage.set(STORAGE_KEYS.FINANCIAL_RECORDS, filtered)
  },

  processPayment: (studentId: string, amount: number, method: "cash" | "check" | "bank_transfer" | "online" | "installment"): FinancialRecord => {
    return financialService.addFinancialRecord({
      studentId,
      type: "payment",
      description: `Payment received via ${method}`,
      amount,
      status: "paid",
      dueDate: new Date().toISOString().split("T")[0],
      paidDate: new Date().toISOString().split("T")[0],
      paymentMethod: method,
    })
  },

  getStudentsByStatus: (status: "paid" | "partial" | "unpaid" | "overdue"): Array<{ studentId: string; summary: FinancialSummary }> => {
    const records = storage.get<FinancialRecord[]>(STORAGE_KEYS.FINANCIAL_RECORDS) || []
    const studentIds = [...new Set(records.map((r) => r.studentId))]

    return studentIds
      .map((studentId) => ({
        studentId,
        summary: financialService.getFinancialSummary(studentId),
      }))
      .filter((item) => {
        if (status === "unpaid") return item.summary.balanceOwed > 0
        if (status === "paid") return item.summary.balanceOwed === 0
        if (status === "partial") return item.summary.totalPaid > 0 && item.summary.balanceOwed > 0
        return false
      })
  },

  generateFinancialReport: (startDate: string, endDate: string) => {
    const records = storage.get<FinancialRecord[]>(STORAGE_KEYS.FINANCIAL_RECORDS) || []
    const filtered = records.filter((r) => {
      const recordDate = new Date(r.createdAt)
      return recordDate >= new Date(startDate) && recordDate <= new Date(endDate)
    })

    return {
      totalAmount: filtered.reduce((sum, r) => sum + r.amount, 0),
      totalPayments: filtered.filter((r) => r.type === "payment").reduce((sum, r) => sum + r.amount, 0),
      totalTuition: filtered.filter((r) => r.type === "tuition").reduce((sum, r) => sum + r.amount, 0),
      totalFees: filtered.filter((r) => r.type === "fee").reduce((sum, r) => sum + r.amount, 0),
      recordCount: filtered.length,
      records: filtered,
    }
  },
}
