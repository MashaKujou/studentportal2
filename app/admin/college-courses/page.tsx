"use client"

import { ProtectedRoute } from "@/app/components/shared/protected-route"
import { AdminDashboard } from "@/app/components/admin/admin-dashboard"
import { CollegeCourses } from "@/app/components/admin/college-courses"

export default function CollegeCoursesPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">College Course Management</h1>
            <p className="text-muted-foreground mt-2">Add or remove diploma and bachelor program courses</p>
          </div>
          <CollegeCourses />
        </div>
      </AdminDashboard>
    </ProtectedRoute>
  )
}
