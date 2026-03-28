import { AdminDashboard } from '@/app/components/admin/admin-dashboard'
import { AdminCampusResourcesManagement } from '@/app/components/admin/campus-resources-management'

export default function AdminCampusResourcesPage() {
  return (
    <AdminDashboard>
      <AdminCampusResourcesManagement />
    </AdminDashboard>
  )
}
