"use client"

import { ProtectedRoute } from "@/app/components/shared/protected-route"
import { AdminDashboard } from "@/app/components/admin/admin-dashboard"
import { SubjectManagement } from "@/app/components/admin/subject-management"

export default function CollegeCoursesPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Subject & Class Management</h1>
            <p className="text-muted-foreground mt-2">Create subjects, manage classes, and assign teachers</p>
          </div>
          <SubjectManagement />
        </div>
      </AdminDashboard>
    </ProtectedRoute>
  )
}
