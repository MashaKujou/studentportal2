import { AdminDashboard } from '@/app/components/admin/admin-dashboard'
import { AdminFinancialManagement } from '@/app/components/admin/financial-management'

export default function AdminFinancialPage() {
  return (
    <AdminDashboard>
      <AdminFinancialManagement />
    </AdminDashboard>
  )
}
