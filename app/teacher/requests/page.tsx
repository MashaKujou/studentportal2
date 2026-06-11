import { TeacherDashboard } from "@/app/components/teacher/teacher-dashboard"
import { TeacherRequests } from "@/app/components/teacher/teacher-requests"

export default function TeacherRequestsPage() {
  return (
    <TeacherDashboard>
      <TeacherRequests />
    </TeacherDashboard>
  )
}