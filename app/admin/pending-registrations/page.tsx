import { AdminDashboard } from "@/app/components/admin/admin-dashboard"
import { PendingRegistrations } from "@/app/components/admin/pending-registrations"

export default function PendingRegistrationsPage() {
  return (
    <AdminDashboard>
      <PendingRegistrations />
    </AdminDashboard>
  )
}
