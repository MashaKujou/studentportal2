import { TeacherDashboard } from "@/app/components/teacher/teacher-dashboard"
import { TeacherNotifications } from "@/app/components/teacher/teacher-notifications"

export default function TeacherNotificationsPage() {
  return (
    <TeacherDashboard>
      <TeacherNotifications />
    </TeacherDashboard>
  )
}
