"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/app/contexts/auth-context"
import { studentService } from "@/app/services/student-service"
import { useMemo } from "react"

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export const StudentSchedule = () => {
  const { user } = useAuth()

  const scheduleData = useMemo(() => {
    if (!user) return {}
    const schedule = studentService.getSchedule(user.id)

    const grouped: Record<string, typeof schedule> = {}
    schedule.forEach((item) => {
      if (!grouped[item.day]) grouped[item.day] = []
      grouped[item.day].push(item)
    })

    return grouped
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Class Schedule</h1>
        <p className="text-muted-foreground">Your weekly class schedule</p>
      </div>

      {DAYS_ORDER.length === 0 || Object.keys(scheduleData).length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-muted-foreground text-center">No schedule available yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DAYS_ORDER.map(
            (day) =>
              scheduleData[day] && (
                <Card key={day}>
                  <CardHeader>
                    <CardTitle className="text-base">{day}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {scheduleData[day].map((item) => (
                        <div key={item.id} className="p-3 bg-muted rounded-lg border border-border">
                          <p className="font-semibold">{item.subject}</p>
                          <p className="text-sm text-muted-foreground">{item.time}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.teacher} | Room {item.room}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ),
          )}
        </div>
      )}
    </div>
  )
}
