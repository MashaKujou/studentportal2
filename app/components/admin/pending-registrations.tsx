"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { userStorage } from "@/lib/storage"
import { useMemo, useState } from "react"
import { formatDate } from "@/lib/formatters"

export const PendingRegistrations = () => {
  const [refreshKey, setRefreshKey] = useState(0)

  const pendingStudents = useMemo(() => {
    const students = userStorage.getStudents()
    return students.filter((s: any) => s.status === "pending")
  }, [refreshKey])

  const handleApprove = (studentId: string) => {
    try {
      userStorage.updateStudent(studentId, {
        status: "approved",
        approvedAt: new Date().toISOString(),
        approvedBy: "admin",
      } as any)
      setRefreshKey((k) => k + 1)
    } catch (error) {
      console.error("Error approving student:", error)
    }
  }

  const handleReject = (studentId: string) => {
    try {
      userStorage.updateStudent(studentId, {
        status: "rejected",
      } as any)
      setRefreshKey((k) => k + 1)
    } catch (error) {
      console.error("Error rejecting student:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pending Registrations</h1>
        <p className="text-muted-foreground">Review and approve new student registrations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Registration Requests</CardTitle>
          <CardDescription>Approve or reject pending registrations</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingStudents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No pending registrations</p>
          ) : (
            <div className="space-y-3">
              {pendingStudents.map((student) => (
                <div key={student.id} className="p-4 border border-border rounded-lg hover:bg-muted">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Grade {student.grade} - Section {student.section}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Registered: {formatDate(student.registeredAt)}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <Button
                      onClick={() => handleApprove(student.id)}
                      className="flex-1 h-9 font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md transition-all duration-200"
                    >
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleReject(student.id)}
                      className="flex-1 h-9 font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all duration-200"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
