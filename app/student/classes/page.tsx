import { MyClasses } from "@/app/components/student/my-classes"
import { StudentDashboard } from "@/app/components/student/student-dashboard"

export default function MyClassesPage() {
  return (
    <StudentDashboard>
      <MyClasses />
    </StudentDashboard>
  )
}
