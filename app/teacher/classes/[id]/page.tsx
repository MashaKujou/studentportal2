import { ClassDetails } from "@/app/components/teacher/class-details"
import { Suspense } from "react"
import { Loading } from "@/app/components/shared/loading"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClassDetailsPage({ params }: PageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<Loading />}>
      <ClassDetails classId={decodeURIComponent(id)} />
    </Suspense>
  )
}
