import { StudentDashboard } from "@/app/components/student/student-dashboard"
import { StudentAttendance } from "@/app/components/student/attendance"

export default function StudentAttendancePage() {
  return (
    <StudentDashboard>
      <StudentAttendance />
    </StudentDashboard>
  )
}
