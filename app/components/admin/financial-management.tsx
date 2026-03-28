'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { financialService, FinancialRecord } from '@/app/services/financial-service'
import { storage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { Student } from '@/lib/storage'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, Edit2, DollarSign } from 'lucide-react'

export function AdminFinancialManagement() {
  const [records, setRecords] = useState<FinancialRecord[]>(() => financialService.getAllFinancialRecords())
  const [filterStudentId, setFilterStudentId] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid' | 'partial' | 'overdue'>('all')

  // Form states
  const [studentId, setStudentId] = useState('')
  const [type, setType] = useState<'tuition' | 'fee' | 'payment' | 'adjustment'>('tuition')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<'paid' | 'unpaid' | 'partial' | 'overdue'>('unpaid')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'check' | 'bank_transfer' | 'online' | 'installment'>('cash')
  const [remarks, setRemarks] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const students = storage.get<Student[]>(STORAGE_KEYS.STUDENTS) || []

  const handleAddRecord = async () => {
    if (!studentId || !amount || !dueDate || !description) {
      alert('Please fill in all required fields')
      return
    }

    try {
      financialService.addFinancialRecord({
        studentId,
        type,
        description,
        amount: parseFloat(amount),
        dueDate,
        status,
        paymentMethod: type === 'payment' ? paymentMethod : undefined,
        remarks: remarks || undefined,
      })

      setRecords(financialService.getAllFinancialRecords())
      setSuccessMessage('Record added successfully')
      setStudentId('')
      setDescription('')
      setAmount('')
      setDueDate('')
      setRemarks('')

      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (error) {
      alert('Error adding record')
    }
  }

  const handleDeleteRecord = (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      financialService.deleteFinancialRecord(id)
      setRecords(financialService.getAllFinancialRecords())
    }
  }

  const handleProcessPayment = (studentId: string, amount: string) => {
    if (!amount) {
      alert('Please enter amount')
      return
    }

    financialService.processPayment(studentId, parseFloat(amount), 'online')
    setRecords(financialService.getAllFinancialRecords())
    setAmount('')
    setSuccessMessage('Payment processed successfully')
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const filteredRecords = records.filter((r) => {
    const matchStudent = !filterStudentId || r.studentId === filterStudentId
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    return matchStudent && matchStatus
  })

  const getStudent = (studentId: string) => students.find((s) => s.id === studentId)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'unpaid':
        return 'bg-red-100 text-red-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalTuition = records.filter((r) => r.type === 'tuition').reduce((sum, r) => sum + r.amount, 0)
  const totalFees = records.filter((r) => r.type === 'fee').reduce((sum, r) => sum + r.amount, 0)
  const totalPaid = records.filter((r) => r.type === 'payment').reduce((sum, r) => sum + r.amount, 0)
  const totalOutstanding = totalTuition + totalFees - totalPaid

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="add">Add Record</TabsTrigger>
        <TabsTrigger value="list">All Records</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tuition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{totalTuition.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{totalFees.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₱{totalPaid.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₱{totalOutstanding.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="add" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Financial Record</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
                {successMessage}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Student</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full border rounded-md p-2 text-sm"
              >
                <option value="">Select a student</option>
                {students.filter((s) => s.status === 'approved').map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Record Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'tuition' | 'fee' | 'payment' | 'adjustment')}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="tuition">Tuition</option>
                  <option value="fee">Fee</option>
                  <option value="payment">Payment</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'paid' | 'unpaid' | 'partial' | 'overdue')}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="e.g., 2024 First Semester Tuition"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (₱)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {type === 'payment' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'check' | 'bank_transfer' | 'online' | 'installment')}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="online">Online</option>
                  <option value="installment">Installment</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Remarks (Optional)</label>
              <Textarea
                placeholder="Additional notes"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleAddRecord} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="list" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Filter Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Student</label>
                <select
                  value={filterStudentId}
                  onChange={(e) => setFilterStudentId(e.target.value)}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="">All Students</option>
                  {students.filter((s) => s.status === 'approved').map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'paid' | 'unpaid' | 'partial' | 'overdue')}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <DollarSign className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No records found</p>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record) => {
              const student = getStudent(record.studentId)
              return (
                <Card key={record.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold text-sm">{record.description}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {record.type}
                          </Badge>
                          <Badge className={getStatusColor(record.status)} variant="secondary" className="text-xs">
                            {record.status}
                          </Badge>
                        </div>
                        {student && (
                          <p className="text-xs text-muted-foreground mb-1">
                            Student: {student.firstName} {student.lastName}
                          </p>
                        )}
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <p>Due: {new Date(record.dueDate).toLocaleDateString()}</p>
                          {record.remarks && <p>Remarks: {record.remarks}</p>}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="text-xl font-bold">₱{record.amount.toLocaleString()}</div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
