import { StudentDashboard } from "@/app/components/student/student-dashboard"
import { StudentNotifications } from "@/app/components/student/student-notifications"

export default function StudentNotificationsPage() {
  return (
    <StudentDashboard>
      <StudentNotifications />
    </StudentDashboard>
  )
}
