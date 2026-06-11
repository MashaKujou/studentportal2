"use client"

import { StudentClassDetails } from "@/app/components/student/class-details"
import { useParams } from "next/navigation"

export default function StudentClassDetailsPage() {
  const params = useParams()
  const classId = params.id as string

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <StudentClassDetails classId={classId} />
      </div>
    </div>
  )
}
