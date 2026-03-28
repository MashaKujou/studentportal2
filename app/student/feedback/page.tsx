import { StudentDashboard } from '@/app/components/student/student-dashboard'
import { StudentFeedback } from '@/app/components/student/feedback'

export default function StudentFeedbackPage() {
  return (
    <StudentDashboard>
      <StudentFeedback />
    </StudentDashboard>
  )
}
