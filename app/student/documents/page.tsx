import { StudentDashboard } from "@/app/components/student/student-dashboard"
import { StudentDocuments } from "@/app/components/student/documents"

export default function StudentDocumentsPage() {
  return (
    <StudentDashboard>
      <StudentDocuments />
    </StudentDashboard>
  )
}
