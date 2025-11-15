import { AdminDashboard } from "@/app/components/admin/admin-dashboard"
import { UserManagement } from "@/app/components/admin/user-management"

export default function UserManagementPage() {
  return (
    <AdminDashboard>
      <UserManagement />
    </AdminDashboard>
  )
}
