import { AdminDashboard } from "@/app/components/admin/admin-dashboard"
import { FinancialManagement } from "@/app/components/admin/financial-management"

export default function AdminFinancialPage() {
  return (
    <AdminDashboard>
      <FinancialManagement />
    </AdminDashboard>
  )
}
