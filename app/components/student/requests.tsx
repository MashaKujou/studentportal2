"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/contexts/auth-context"
import { studentService } from "@/app/services/student-service"
import { useEffect, useState } from "react"
import { REQUEST_TYPES } from "@/lib/constants"
import { CheckCircle, Clock, XCircle, Eye } from 'lucide-react'
import { requestMessagesStorage } from "@/lib/storage"

export const StudentRequests = () => {
  const { user } = useAuth()
  const [requestType, setRequestType] = useState("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null)
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    if (!user) return

    const fetchRequests = () => {
      const allRequests = studentService.getRequests(user.id)
      console.log("[v0] Fetched requests for student:", user.id, allRequests)
      setRequests(allRequests)
    }

    fetchRequests()

    const interval = setInterval(fetchRequests, 3000)
    return () => clearInterval(interval)
  }, [user])

  const getRequestMessages = (requestId: string) => {
    return requestMessagesStorage.getByRequestId(requestId)
  }

  const statusMessages: { [key: string]: string } = {
    pending: "Your Request is still Pending",
    read: "Your Request has been read by admin",
    in_progress: "Your Request has been viewed by admin and in Progress",
    completed: "Your Request has been Completed pick it up on Registrar",
    rejected: "I'm sorry but your Request is Rejected",
  }

  const handleSubmitRequest = async () => {
    if (!user || !requestType || !reason.trim()) return

    setIsSubmitting(true)
    try {
      studentService.createRequest({
        studentId: user.id,
        type: requestType,
        status: "pending",
        reason,
      })
      setRequestType("")
      setReason("")
      const updatedRequests = studentService.getRequests(user.id)
      setRequests(updatedRequests)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "read":
      case "in_progress":
        return <Eye className="w-5 h-5 text-blue-500" />
      default:
        return <Eye className="w-5 h-5 text-blue-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Document Requests</h1>
        <p className="text-muted-foreground">Submit and track document requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit a Request</CardTitle>
          <CardDescription>Request documents or services from the administration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-2">
                Request Type
              </label>
              <select
                id="type"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Select a request type</option>
                {REQUEST_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium mb-2">
                Reason/Details
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide details about your request"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows={4}
              />
            </div>

            <Button 
              onClick={handleSubmitRequest} 
              disabled={isSubmitting || !requestType || !reason}
              className="w-full h-10 font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
          <CardDescription>Track the status of your submitted requests</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No requests submitted yet</p>
          ) : (
            <div className="space-y-2">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer transition"
                  onClick={() => setExpandedRequest(expandedRequest === req.id ? null : req.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(req.status)}
                      <div>
                        <p className="font-semibold">{req.type}</p>
                        <p className="text-sm text-muted-foreground">{req.reason}</p>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        req.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : req.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : req.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : req.status === "read"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {req.status.replace("_", " ").charAt(0).toUpperCase() + req.status.replace("_", " ").slice(1)}
                    </div>
                  </div>

                  {expandedRequest === req.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Status Message:</p>
                        <p className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
                          {statusMessages[req.status] || "No message"}
                        </p>
                      </div>

                      {getRequestMessages(req.id).length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Admin Messages:</p>
                          <div className="space-y-2">
                            {getRequestMessages(req.id).map((msg) => (
                              <div key={msg.id} className="bg-gray-50 p-3 rounded border border-gray-200">
                                <p className="text-xs font-semibold text-gray-600 mb-1">Admin Reply</p>
                                <p className="text-sm text-gray-700">{msg.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(req.createdAt).toLocaleDateString()}
                        {req.completedAt && ` • Completed: ${new Date(req.completedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
