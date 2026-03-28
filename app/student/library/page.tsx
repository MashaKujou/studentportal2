import { StudentDashboard } from '@/app/components/student/student-dashboard'
import { StudentLibrary } from '@/app/components/student/library'

export default function StudentLibraryPage() {
  return (
    <StudentDashboard>
      <StudentLibrary />
    </StudentDashboard>
  )
}
