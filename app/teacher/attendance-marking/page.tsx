import { TeacherDashboard } from "@/app/components/teacher/teacher-dashboard"
import { TeacherAttendanceMarking } from "@/app/components/teacher/attendance-marking"

export default function TeacherAttendanceMarkingPage() {
  return (
    <TeacherDashboard>
      <TeacherAttendanceMarking />
    </TeacherDashboard>
  )
}
