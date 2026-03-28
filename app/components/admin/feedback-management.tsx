'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { feedbackService, Feedback } from '@/app/services/feedback-service'
import { storage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { Student } from '@/lib/storage'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trash2, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react'

export function AdminFeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => feedbackService.getAllFeedback())
  const [filterStatus, setFilterStatus] = useState<'all' | Feedback['status']>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [response, setResponse] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const students = storage.get<Student[]>(STORAGE_KEYS.STUDENTS) || []
  const stats = feedbackService.getFeedbackStats()

  const handleRespondToFeedback = () => {
    if (!selectedFeedback || !response.trim()) {
      alert('Please enter a response')
      return
    }

    feedbackService.addResponse(selectedFeedback.id, response, 'Admin')
    setFeedbacks(feedbackService.getAllFeedback())
    setSelectedFeedback(null)
    setResponse('')
    setSuccessMessage('Response sent to student')
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const handleChangeStatus = (feedbackId: string, newStatus: Feedback['status']) => {
    feedbackService.updateStatus(feedbackId, newStatus)
    setFeedbacks(feedbackService.getAllFeedback())
    if (selectedFeedback?.id === feedbackId) {
      const updated = feedbackService.getFeedbackById(feedbackId)
      setSelectedFeedback(updated)
    }
  }

  const handleDeleteFeedback = (id: string) => {
    if (confirm('Delete this feedback?')) {
      feedbackService.deleteFeedback(id)
      setFeedbacks(feedbackService.getAllFeedback())
      setSelectedFeedback(null)
    }
  }

  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchStatus = filterStatus === 'all' || f.status === filterStatus
    const matchCategory = filterCategory === 'all' || f.category === filterCategory
    return matchStatus && matchCategory
  })

  const getStudent = (studentId: string) => students.find((s) => s.id === studentId)

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'bug':
        return 'bg-red-100 text-red-800'
      case 'feature_request':
        return 'bg-blue-100 text-blue-800'
      case 'complaint':
        return 'bg-orange-100 text-orange-800'
      case 'suggestion':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const newFeedbackCount = feedbacks.filter((f) => f.status === 'new').length
  const reviewingCount = feedbacks.filter((f) => f.status === 'reviewing').length

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="list">All Feedback</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFeedback}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{newFeedbackCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reviewing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{reviewingCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Responded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.averageResolutionTime}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Feedback by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <div key={category} className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground capitalize">{category.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="list" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Filter Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | Feedback['status'])}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="bug">Bug</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="complaint">Complaint</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3">
            {filteredFeedbacks.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No feedback found</p>
                </CardContent>
              </Card>
            ) : (
              filteredFeedbacks.map((feedback) => (
                <Card
                  key={feedback.id}
                  className={`cursor-pointer transition-all ${
                    selectedFeedback?.id === feedback.id ? 'border-blue-500 bg-blue-50/30' : ''
                  }`}
                  onClick={() => setSelectedFeedback(feedback)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{feedback.subject}</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          From: {getStudent(feedback.studentId)?.firstName} {getStudent(feedback.studentId)?.lastName}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={getStatusColor(feedback.status)} variant="secondary" className="text-xs">
                          {feedback.status}
                        </Badge>
                        <Badge className={getCategoryColor(feedback.category)} variant="secondary" className="text-xs">
                          {feedback.category.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>

                    {feedback.priority === 'high' && (
                      <div className="flex items-center gap-1 text-xs text-red-600 mb-2">
                        <AlertCircle className="w-3 h-3" />
                        High Priority
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground line-clamp-2">{feedback.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(feedback.createdAt).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div>
            {selectedFeedback ? (
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Feedback Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-1">Subject</p>
                    <p className="text-sm text-muted-foreground">{selectedFeedback.subject}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-1">From</p>
                    <p className="text-sm text-muted-foreground">
                      {getStudent(selectedFeedback.studentId)?.firstName}{' '}
                      {getStudent(selectedFeedback.studentId)?.lastName} (
                      {getStudent(selectedFeedback.studentId)?.email})
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-1">Message</p>
                    <p className="text-sm text-muted-foreground">{selectedFeedback.message}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Change Status</p>
                    <select
                      value={selectedFeedback.status}
                      onChange={(e) => handleChangeStatus(selectedFeedback.id, e.target.value as Feedback['status'])}
                      className="w-full border rounded-md p-2 text-sm"
                    >
                      <option value="new">New</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {!selectedFeedback.adminResponse ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Send Response</p>
                      <Textarea
                        placeholder="Write your response here..."
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        rows={4}
                        className="text-sm"
                      />
                      <Button
                        onClick={handleRespondToFeedback}
                        className="w-full"
                        size="sm"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Send Response
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                      <p className="text-sm font-semibold text-green-900">Response Sent</p>
                      <p className="text-xs text-green-800">{selectedFeedback.adminResponse}</p>
                      <p className="text-xs text-green-700 mt-1">
                        By {selectedFeedback.respondedBy} on{' '}
                        {selectedFeedback.respondedAt && new Date(selectedFeedback.respondedAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteFeedback(selectedFeedback.id)}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Feedback
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">Select feedback to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
