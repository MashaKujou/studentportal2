"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminService } from "@/app/services/admin-service"
import { useMemo } from "react"

export const AdminAnalytics = () => {
  const stats = useMemo(() => {
    return adminService.getSystemStatistics()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Analytics</h1>
        <p className="text-muted-foreground">System-wide statistics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Student Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total Students:</span>
              <span className="font-semibold">{stats.totalStudents}</span>
            </div>
            <div className="flex justify-between">
              <span>Approved:</span>
              <span className="font-semibold text-green-600">{stats.approvedStudents}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending:</span>
              <span className="font-semibold text-yellow-600">{stats.pendingStudents}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Teacher Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total Teachers:</span>
              <span className="font-semibold">{stats.totalTeachers}</span>
            </div>
            <div className="flex justify-between">
              <span>Active:</span>
              <span className="font-semibold text-green-600">{stats.activeTeachers}</span>
            </div>
            <div className="flex justify-between">
              <span>Inactive:</span>
              <span className="font-semibold text-red-600">{stats.totalTeachers - stats.activeTeachers}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
