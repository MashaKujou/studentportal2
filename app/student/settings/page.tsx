import { StudentDashboard } from "@/app/components/student/student-dashboard"
import { StudentSettings } from "@/app/components/student/student-settings"

export default function StudentSettingsPage() {
  return (
    <StudentDashboard>
      <StudentSettings />
    </StudentDashboard>
  )
}
