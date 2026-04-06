'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { financialService, FinancialRecord, FinancialSummary } from '@/app/services/financial-service'
import { useAuth } from '@/app/contexts/auth-context'
import { CreditCard, DollarSign, FileText, Download } from 'lucide-react'

export function StudentFinancial() {
  const { user } = useAuth()
  const [records, setRecords] = useState<FinancialRecord[]>([])
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'tuition' | 'fee' | 'payment'>('all')

  useEffect(() => {
    if (user) {
      loadFinancialData()
    }
  }, [user])

  const loadFinancialData = () => {
    if (!user) return
    const allRecords = financialService.getStudentFinancialRecords(user.id)
    const financialSummary = financialService.getFinancialSummary(user.id)
    setRecords(allRecords)
    setSummary(financialSummary)
  }

  const filteredRecords = filterType === 'all' ? records : records.filter((r) => r.type === filterType)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      case 'unpaid':
        return 'bg-red-100 text-red-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tuition':
        return 'bg-blue-100 text-blue-800'
      case 'fee':
        return 'bg-purple-100 text-purple-800'
      case 'payment':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDownloadReceipt = (record: FinancialRecord) => {
    if (!record.receipt) {
      alert('No receipt available for this record')
      return
    }
    // In a real app, this would download the receipt
    window.open(record.receipt, '_blank')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Financial Information</h2>
        <p className="text-muted-foreground">Manage your tuition, fees, and payment information</p>
      </div>

      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tuition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div className="text-2xl font-bold">₱{summary.totalTuition.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div className="text-2xl font-bold">₱{summary.totalFees.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-600" />
                <div className="text-2xl font-bold text-green-600">₱{summary.totalPaid.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>

          <Card className={summary.balanceOwed > 0 ? 'border-red-200 bg-red-50/30' : 'border-green-200 bg-green-50/30'}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Balance Owed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className={`w-4 h-4 ${summary.balanceOwed > 0 ? 'text-red-600' : 'text-green-600'}`} />
                <div className={`text-2xl font-bold ${summary.balanceOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₱{summary.balanceOwed.toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Transaction History</h3>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filterType === 'tuition' ? 'default' : 'outline'}
              onClick={() => setFilterType('tuition')}
              size="sm"
            >
              Tuition
            </Button>
            <Button
              variant={filterType === 'fee' ? 'default' : 'outline'}
              onClick={() => setFilterType('fee')}
              size="sm"
            >
              Fees
            </Button>
            <Button
              variant={filterType === 'payment' ? 'default' : 'outline'}
              onClick={() => setFilterType('payment')}
              size="sm"
            >
              Payments
            </Button>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No records found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{record.description}</h4>
                        <Badge className={getTypeColor(record.type)} variant="secondary">
                          {record.type}
                        </Badge>
                        <Badge className={getStatusColor(record.status)} variant="secondary">
                          {record.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Due Date: {new Date(record.dueDate).toLocaleDateString()}</p>
                        {record.paidDate && <p>Paid Date: {new Date(record.paidDate).toLocaleDateString()}</p>}
                        {record.paymentMethod && <p>Method: {record.paymentMethod.replace(/_/g, ' ')}</p>}
                        {record.remarks && <p>Remarks: {record.remarks}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">₱{record.amount.toLocaleString()}</div>
                      {record.receipt && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReceipt(record)}
                          className="mt-2"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>To make a payment, contact the admin or visit the finance office</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3">Accepted payment methods:</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Cash (Finance Office)</li>
            <li>• Check (Payable to the Institution)</li>
            <li>• Bank Transfer (Details available at Finance Office)</li>
            <li>• Online Payment (Through student portal)</li>
            <li>• Installment Plans (Available upon request)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
