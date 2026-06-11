import { StudentDashboard } from "@/app/components/student/student-dashboard"
import { StudentGrades } from "@/app/components/student/grades"

export default function StudentGradesPage() {
  return (
    <StudentDashboard>
      <StudentGrades />
    </StudentDashboard>
  )
}
