import { AdminDashboard } from '@/app/components/admin/admin-dashboard'
import { AdminNotificationsManagement } from '@/app/components/admin/notifications-management'

export default function AdminNotificationsPage() {
  return (
    <AdminDashboard>
      <AdminNotificationsManagement />
    </AdminDashboard>
  )
}
