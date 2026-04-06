import { AdminDashboard } from '@/app/components/admin/admin-dashboard'
import { AdminLibraryManagement } from '@/app/components/admin/library-management'

export default function AdminLibraryPage() {
  return (
    <AdminDashboard>
      <AdminLibraryManagement />
    </AdminDashboard>
  )
}
