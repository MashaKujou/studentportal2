import { StudentDashboard } from "@/app/components/student/student-dashboard"
import { StudentDashboardHome } from "@/app/components/student/dashboard-home"

export default function StudentDashboardPage() {
  return (
    <StudentDashboard>
      <StudentDashboardHome />
    </StudentDashboard>
  )
}
