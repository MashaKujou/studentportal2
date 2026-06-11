import { StudentDashboard } from "@/app/components/student/student-dashboard"
import { StudentRequests } from "@/app/components/student/requests"

export default function StudentRequestsPage() {
  return (
    <StudentDashboard>
      <StudentRequests />
    </StudentDashboard>
  )
}
