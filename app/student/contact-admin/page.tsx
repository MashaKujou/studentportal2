import { StudentDashboard } from "@/app/components/student/student-dashboard"
import { StudentContactAdmin } from "@/app/components/student/contact-admin"

export default function StudentContactAdminPage() {
  return (
    <StudentDashboard>
      <StudentContactAdmin />
    </StudentDashboard>
  )
}
