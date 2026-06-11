import { AdminDashboard } from "@/app/components/admin/admin-dashboard"
import { TeacherRequestManagement } from "@/app/components/admin/teacher-request-management"

export default function AdminTeacherRequestsPage() {
  return (
    <AdminDashboard>
      <TeacherRequestManagement />
    </AdminDashboard>
  )
}