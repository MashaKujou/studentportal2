'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { feedbackService, Feedback } from '@/app/services/feedback-service'
import { useAuth } from '@/app/contexts/auth-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Send, MessageSquare, AlertCircle, HelpCircle, Lightbulb } from 'lucide-react'

type FeedbackCategory = 'bug' | 'feature_request' | 'general' | 'complaint' | 'suggestion'
type FeedbackPriority = 'low' | 'medium' | 'high'

export function StudentFeedback() {
  const { user } = useAuth()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | Feedback['status']>('all')

  // Form states
  const [category, setCategory] = useState<FeedbackCategory>('general')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<FeedbackPriority>('medium')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadFeedback()
  }, [user])

  const loadFeedback = () => {
    if (!user) return
    setFeedbacks(feedbackService.getStudentFeedback(user.id))
  }

  const handleSubmitFeedback = () => {
    if (!user || !subject.trim() || !message.trim()) {
      alert('Please fill in subject and message')
      return
    }

    feedbackService.submitFeedback({
      studentId: user.id,
      category,
      subject,
      message,
      priority,
    })

    setSuccessMessage('Thank you! Your feedback has been submitted.')
    loadFeedback()
    setSubject('')
    setMessage('')
    setCategory('general')
    setPriority('medium')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const filteredFeedbacks = filterStatus === 'all' ? feedbacks : feedbacks.filter((f) => f.status === filterStatus)

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'bug':
        return <AlertCircle className="w-4 h-4" />
      case 'feature_request':
        return <Lightbulb className="w-4 h-4" />
      case 'complaint':
        return <AlertCircle className="w-4 h-4" />
      case 'suggestion':
        return <HelpCircle className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

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

  return (
    <Tabs defaultValue="submit" className="space-y-4">
      <TabsList>
        <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
        <TabsTrigger value="history">My Feedback</TabsTrigger>
      </TabsList>

      <TabsContent value="submit" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Send Feedback</CardTitle>
            <CardDescription>Help us improve by sharing your thoughts, reporting bugs, or requesting features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
                {successMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="general">General</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="complaint">Complaint</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as FeedbackPriority)}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Brief subject of your feedback"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Provide detailed feedback here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
            </div>

            <Button onClick={handleSubmitFeedback} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Submit Feedback
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        <div className="flex gap-2 flex-wrap mb-4">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'new' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('new')}
            size="sm"
          >
            New
          </Button>
          <Button
            variant={filterStatus === 'reviewing' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('reviewing')}
            size="sm"
          >
            Reviewing
          </Button>
          <Button
            variant={filterStatus === 'resolved' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('resolved')}
            size="sm"
          >
            Resolved
          </Button>
        </div>

        {filteredFeedbacks.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {filterStatus === 'all' ? "You haven't submitted any feedback yet" : 'No feedback found in this status'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredFeedbacks.map((feedback) => (
              <Card key={feedback.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{feedback.subject}</h3>
                      <Badge className={getCategoryColor(feedback.category)} variant="secondary" className="text-xs flex items-center gap-1">
                        {getCategoryIcon(feedback.category)}
                        {feedback.category.replace(/_/g, ' ')}
                      </Badge>
                      <Badge className={getStatusColor(feedback.status)} variant="secondary" className="text-xs">
                        {feedback.status}
                      </Badge>
                      {feedback.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs">
                          High Priority
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{feedback.message}</p>

                  <div className="text-xs text-muted-foreground space-y-1 border-t pt-2">
                    <p>Submitted: {new Date(feedback.createdAt).toLocaleString()}</p>
                    {feedback.respondedAt && (
                      <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                        <p className="font-semibold text-green-900 mb-1">Admin Response:</p>
                        <p className="text-green-800">{feedback.adminResponse}</p>
                        <p className="text-xs text-green-700 mt-1">
                          Responded by {feedback.respondedBy} on {new Date(feedback.respondedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
