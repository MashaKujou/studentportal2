import { AdminDashboard } from '@/app/components/admin/admin-dashboard'
import { AdminFeedbackManagement } from '@/app/components/admin/feedback-management'

export default function AdminFeedbackPage() {
  return (
    <AdminDashboard>
      <AdminFeedbackManagement />
    </AdminDashboard>
  )
}
