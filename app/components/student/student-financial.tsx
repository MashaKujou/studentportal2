"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/app/contexts/auth-context"
import { financialStorage, type FinancialFeeAssignment, type FinancialPaymentStatus } from "@/lib/storage"
import { ACADEMIC_LEVELS } from "@/lib/constants"

type SortOption = "newest" | "oldest" | "amount_high" | "amount_low" | "name"

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount)

const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString()

const getAssignmentGroup = (assignment: FinancialFeeAssignment) => {
  if (assignment.academicLevel === ACADEMIC_LEVELS.SENIOR_HIGH) {
    return `Grade ${assignment.gradeOrYear} - ${assignment.targetName}`
  }

  return `${assignment.targetName} Year ${assignment.gradeOrYear}`
}

const getPaymentStatusLabel = (status: FinancialPaymentStatus) => {
  return status === "paid" ? "Paid" : "Not Paid"
}

export const StudentFinancial = () => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")

  const financialItems = useMemo(() => {
    if (!user?.id) {
      return []
    }

    const assignments = financialStorage.getByStudentId(user.id)
    const query = searchQuery.trim().toLowerCase()

    const filteredAssignments = query
      ? assignments.filter((assignment) => {
          const values = [assignment.title, assignment.description || "", assignment.targetName, assignment.gradeOrYear]
          return values.some((value) => value.toLowerCase().includes(query))
        })
      : assignments

    return filteredAssignments.sort((left, right) => {
      if (sortBy === "oldest") {
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      }

      if (sortBy === "amount_high") {
        return right.amount - left.amount
      }

      if (sortBy === "amount_low") {
        return left.amount - right.amount
      }

      if (sortBy === "name") {
        return left.title.localeCompare(right.title)
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    })
  }, [searchQuery, sortBy, user?.id])

  const totalAmount = financialItems.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial</h1>
        <p className="text-muted-foreground">View the fees assigned to your current academic level, grade, year, strand, or course.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Assigned Fees</CardDescription>
            <CardTitle>{financialItems.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Amount</CardDescription>
            <CardTitle>{formatCurrency(totalAmount)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Your Group</CardDescription>
            <CardTitle className="text-lg">
              {user?.academicLevel === ACADEMIC_LEVELS.SENIOR_HIGH
                ? `Grade ${user?.grade} - ${user?.strand}`
                : `${user?.course} Year ${user?.year}`}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Financial Fees</CardTitle>
          <CardDescription>Use the search and sort controls to review your fees.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <Input
              placeholder="Search fees, course, strand, grade, or year..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="amount_high">Sort: Amount High to Low</option>
              <option value="amount_low">Sort: Amount Low to High</option>
              <option value="name">Sort: Name A-Z</option>
            </select>
          </div>

          {financialItems.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              No financial fees have been assigned to your current academic group yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {financialItems.map((assignment) => {
                const paymentStatus = user?.id ? financialStorage.getStudentPaymentStatus(assignment.id, user.id) : "not_paid"

                return (
                <div key={assignment.id} className="rounded-lg border p-4 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold">{assignment.title}</h2>
                      <p className="text-sm">
                        <span className="font-medium">Status: </span>
                        <span className={paymentStatus === "paid" ? "text-green-600" : "text-amber-600"}>
                          {getPaymentStatusLabel(paymentStatus)}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">{assignment.description || "No additional notes provided."}</p>
                      <p className="text-sm text-muted-foreground">Assigned To: {getAssignmentGroup(assignment)}</p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.dueDate ? `Due: ${formatDate(assignment.dueDate)}` : "Due date not set"}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-2xl font-bold">{formatCurrency(assignment.amount)}</p>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
