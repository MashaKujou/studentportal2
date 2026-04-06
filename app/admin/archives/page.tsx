import { AdminDashboard } from '@/app/components/admin/admin-dashboard'
import { ArchiveManagement } from '@/app/components/admin/archive-management'

export default function ArchivesPage() {
  return (
    <AdminDashboard>
      <ArchiveManagement />
    </AdminDashboard>
  )
}
