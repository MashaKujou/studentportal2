import { StudentDashboard } from '@/app/components/student/student-dashboard'
import { StudentFinancial } from '@/app/components/student/financial'

export default function StudentFinancialPage() {
  return (
    <StudentDashboard>
      <StudentFinancial />
    </StudentDashboard>
  )
}
