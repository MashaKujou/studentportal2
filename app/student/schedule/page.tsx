import { StudentDashboard } from "@/app/components/student/student-dashboard"
import { StudentSchedule } from "@/app/components/student/schedule"

export default function StudentSchedulePage() {
  return (
    <StudentDashboard>
      <StudentSchedule />
    </StudentDashboard>
  )
}
