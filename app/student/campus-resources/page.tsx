import { StudentDashboard } from '@/app/components/student/student-dashboard'
import { StudentCampusResources } from '@/app/components/student/campus-resources'

export default function StudentCampusResourcesPage() {
  return (
    <StudentDashboard>
      <StudentCampusResources />
    </StudentDashboard>
  )
}
