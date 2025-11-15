"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { adminService } from "@/app/services/admin-service"
import { useMemo, useState } from "react"
import { formatDate } from "@/lib/formatters"

export const PendingRegistrations = () => {
  const [refreshKey, setRefreshKey] = useState(0)

  const pendingStudents = useMemo(() => {
    return adminService.getPendingStudents()
  }, [refreshKey])

  const handleApprove = (studentId: string) => {
    adminService.approveStudent(studentId)
    setRefreshKey((k) => k + 1)
  }

  const handleReject = (studentId: string) => {
    adminService.rejectStudent(studentId)
    setRefreshKey((k) => k + 1)
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

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(student.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(student.id)}>
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
