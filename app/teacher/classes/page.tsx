import { TeacherDashboard } from "@/app/components/teacher/teacher-dashboard"
import { TeacherMyClasses } from "@/app/components/teacher/my-classes"

export default function TeacherClassesPage() {
  return (
    <TeacherDashboard>
      <TeacherMyClasses />
    </TeacherDashboard>
  )
}
