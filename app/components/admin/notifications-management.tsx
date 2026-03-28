'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { notificationService } from '@/app/services/notification-service'
import { storage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { Student } from '@/lib/storage'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Send, Users } from 'lucide-react'

type NotificationType = 'deadline' | 'schedule_change' | 'payment_due' | 'grade_posted' | 'registration_open' | 'event' | 'system' | 'other'

export function AdminNotificationsManagement() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<NotificationType>('system')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [sendToAll, setSendToAll] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const students = storage.get<Student[]>(STORAGE_KEYS.STUDENTS) || []
  const approvedStudents = students.filter((s) => s.status === 'approved')

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    )
  }

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Please fill in title and message')
      return
    }

    const recipientIds = sendToAll ? approvedStudents.map((s) => s.id) : selectedStudents

    if (recipientIds.length === 0) {
      alert('Please select at least one student or enable "Send to All"')
      return
    }

    setIsLoading(true)
    try {
      notificationService.sendBulkNotification(recipientIds, {
        type,
        title,
        message,
        status: 'unread',
      })

      setSuccessMessage(
        `Notification sent successfully to ${recipientIds.length} student${recipientIds.length !== 1 ? 's' : ''}`
      )
      setTitle('')
      setMessage('')
      setType('system')
      setSelectedStudents([])
      setSendToAll(false)

      setTimeout(() => setSuccessMessage(''), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs defaultValue="send" className="space-y-4">
      <TabsList>
        <TabsTrigger value="send">Send Notification</TabsTrigger>
        <TabsTrigger value="templates">Quick Templates</TabsTrigger>
      </TabsList>

      <TabsContent value="send" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Send Bulk Notification</CardTitle>
            <CardDescription>Send notifications to one or multiple students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
                {successMessage}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Notification Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NotificationType)}
                className="w-full border rounded-md p-2 text-sm"
              >
                <option value="deadline">Deadline</option>
                <option value="schedule_change">Schedule Change</option>
                <option value="payment_due">Payment Due</option>
                <option value="grade_posted">Grade Posted</option>
                <option value="registration_open">Registration Open</option>
                <option value="event">Event</option>
                <option value="system">System</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Notification message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendToAll"
                  checked={sendToAll}
                  onChange={(e) => setSendToAll(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="sendToAll" className="text-sm font-medium cursor-pointer">
                  Send to All Approved Students ({approvedStudents.length})
                </label>
              </div>

              {!sendToAll && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Students</label>
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {approvedStudents.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No approved students available</p>
                    ) : (
                      approvedStudents.map((student) => (
                        <div key={student.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`student-${student.id}`}
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleSelectStudent(student.id)}
                            className="rounded"
                          />
                          <label
                            htmlFor={`student-${student.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {student.firstName} {student.lastName} ({student.email})
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  {selectedStudents.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={handleSendNotification}
              disabled={isLoading || (!sendToAll && selectedStudents.length === 0)}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="templates" className="space-y-4">
        <div className="grid gap-3">
          {[
            {
              title: 'Grades Posted',
              message: 'Your grades for this semester have been posted. Please check your grades page for details.',
              type: 'grade_posted' as NotificationType,
            },
            {
              title: 'Payment Deadline',
              message: 'Please remember to pay your tuition fees before the deadline. Late payments may incur penalties.',
              type: 'payment_due' as NotificationType,
            },
            {
              title: 'Registration Open',
              message: 'Course registration is now open. Please proceed to the registration portal to enroll in your courses.',
              type: 'registration_open' as NotificationType,
            },
            {
              title: 'Schedule Change',
              message: 'There has been a change to your class schedule. Please review your updated schedule.',
              type: 'schedule_change' as NotificationType,
            },
          ].map((template, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => {
                setTitle(template.title)
                setMessage(template.message)
                setType(template.type)
              }}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{template.title}</h3>
                    <p className="text-xs text-muted-foreground">{template.message}</p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {template.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
