"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/app/contexts/auth-context"
import { teacherRequestsStorage, type TeacherRequest } from "@/lib/storage"
import { teacherService } from "@/app/services/teacher-service"
import { TEACHER_REQUEST_TYPES } from "@/lib/constants"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, FileText } from "lucide-react"

type RequestTab = "leave_of_absence" | "make_up_class"

const statusConfig: Record<string, { icon: React.ReactNode; bgClass: string; label: string }> = {
  pending: {
    icon: <Clock className="w-5 h-5 text-yellow-500" />,
    bgClass: "bg-yellow-100 text-yellow-800",
    label: "Pending",
  },
  approved: {
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    bgClass: "bg-green-100 text-green-800",
    label: "Approved",
  },
  rejected: {
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    bgClass: "bg-red-100 text-red-800",
    label: "Rejected",
  },
}

export const TeacherRequests = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<RequestTab>("leave_of_absence")
  const [requests, setRequests] = useState<TeacherRequest[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Leave of Absence form
  const [loaStartDate, setLoaStartDate] = useState("")
  const [loaEndDate, setLoaEndDate] = useState("")
  const [loaReason, setLoaReason] = useState("")

  // Make Up Class form
  const [mucSubject, setMucSubject] = useState("")
  const [mucOriginalDate, setMucOriginalDate] = useState("")
  const [mucOriginalTime, setMucOriginalTime] = useState("")
  const [mucProposedDate, setMucProposedDate] = useState("")
  const [mucProposedTime, setMucProposedTime] = useState("")
  const [mucReason, setMucReason] = useState("")

  const teacherClasses = user ? teacherService.getMyClasses(user.id) : []

  const loadRequests = useCallback(() => {
    if (!user) return
    const all = teacherRequestsStorage.getByTeacherId(user.id)
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setRequests(all)
  }, [user])

  useEffect(() => {
    loadRequests()
    const interval = setInterval(loadRequests, 3000)
    return () => clearInterval(interval)
  }, [loadRequests])

  const resetForms = () => {
    setLoaStartDate("")
    setLoaEndDate("")
    setLoaReason("")
    setMucSubject("")
    setMucOriginalDate("")
    setMucOriginalTime("")
    setMucProposedDate("")
    setMucProposedTime("")
    setMucReason("")
  }

  const handleSubmitLeave = async () => {
    if (!user || !loaStartDate || !loaEndDate || !loaReason.trim()) return
    setIsSubmitting(true)
    try {
      const teacherName = `${user.firstName} ${user.lastName}`.trim()
      teacherRequestsStorage.create({
        teacherId: user.id,
        teacherName,
        type: "leave_of_absence",
        status: "pending",
        startDate: loaStartDate,
        endDate: loaEndDate,
        reasonForLeave: loaReason.trim(),
      })
      resetForms()
      loadRequests()
    } catch (err) {
      console.error("Failed to submit leave request:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitMakeUp = async () => {
    if (!user || !mucSubject || !mucOriginalDate || !mucProposedDate || !mucReason.trim()) return
    setIsSubmitting(true)
    try {
      const teacherName = `${user.firstName} ${user.lastName}`.trim()
      const selectedClass = teacherClasses.find((c) => c.id === mucSubject)
      teacherRequestsStorage.create({
        teacherId: user.id,
        teacherName,
        type: "make_up_class",
        status: "pending",
        subject: selectedClass?.subjectName || mucSubject,
        subjectCode: selectedClass?.subjectCode,
        originalDate: mucOriginalDate,
        originalTime: mucOriginalTime || undefined,
        proposedDate: mucProposedDate,
        proposedTime: mucProposedTime || undefined,
        reasonForMakeUp: mucReason.trim(),
      })
      resetForms()
      loadRequests()
    } catch (err) {
      console.error("Failed to submit make up class request:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmitLeave = loaStartDate && loaEndDate && loaReason.trim() && loaEndDate >= loaStartDate
  const canSubmitMakeUp = mucSubject && mucOriginalDate && mucProposedDate && mucReason.trim()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teacher Requests</h1>
        <p className="text-muted-foreground">Submit and track leave of absence &amp; make up class requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit a Request</CardTitle>
          <CardDescription>Choose request type below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tab switcher */}
          <div className="flex gap-2 border-b pb-2">
            {TEACHER_REQUEST_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setActiveTab(t.value)}
                className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${
                  activeTab === t.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Leave of Absence Form */}
          {activeTab === "leave_of_absence" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={loaStartDate}
                    onChange={(e) => setLoaStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date *</label>
                  <input
                    type="date"
                    value={loaEndDate}
                    onChange={(e) => setLoaEndDate(e.target.value)}
                    min={loaStartDate || undefined}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  />
                </div>
              </div>
              {loaStartDate && loaEndDate && loaEndDate < loaStartDate && (
                <p className="text-sm text-red-500">End date must be on or after start date.</p>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Reason for Leave *</label>
                <textarea
                  value={loaReason}
                  onChange={(e) => setLoaReason(e.target.value)}
                  placeholder="Explain the reason for your leave of absence..."
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                />
              </div>
              <Button
                onClick={handleSubmitLeave}
                disabled={isSubmitting || !canSubmitLeave}
                className="w-full h-10 font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Leave of Absence Request"}
              </Button>
            </div>
          )}

          {/* Make Up Class Form */}
          {activeTab === "make_up_class" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject/Class *</label>
                <select
                  value={mucSubject}
                  onChange={(e) => setMucSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="">Select a class</option>
                  {teacherClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.subjectName} ({c.subjectCode}) — {c.day} {c.time}
                    </option>
                  ))}
                </select>
                {teacherClasses.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">No classes assigned yet.</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Original Date *</label>
                  <input
                    type="date"
                    value={mucOriginalDate}
                    onChange={(e) => setMucOriginalDate(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Original Time</label>
                  <input
                    type="time"
                    value={mucOriginalTime}
                    onChange={(e) => setMucOriginalTime(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Proposed Make-Up Date *</label>
                  <input
                    type="date"
                    value={mucProposedDate}
                    onChange={(e) => setMucProposedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Proposed Time</label>
                  <input
                    type="time"
                    value={mucProposedTime}
                    onChange={(e) => setMucProposedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason for Make-Up Class *</label>
                <textarea
                  value={mucReason}
                  onChange={(e) => setMucReason(e.target.value)}
                  placeholder="Explain why the class needs to be rescheduled..."
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                />
              </div>
              <Button
                onClick={handleSubmitMakeUp}
                disabled={isSubmitting || !canSubmitMakeUp}
                className="w-full h-10 font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Make Up Class Request"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
          <CardDescription>Track the status of your submitted requests</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No requests submitted yet.</p>
              <p className="text-sm">Use the form above to submit a leave of absence or make up class request.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {requests.map((req) => {
                const cfg = statusConfig[req.status] || statusConfig.pending
                const isExpanded = expandedId === req.id
                const isLoa = req.type === "leave_of_absence"

                return (
                  <div
                    key={req.id}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : req.id)}
                      className="w-full text-left p-4 hover:bg-muted/40 transition-colors flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {cfg.icon}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">
                            {isLoa ? "Leave of Absence" : "Make Up Class"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {isLoa
                              ? `${req.startDate || ""} → ${req.endDate || ""}`
                              : `${req.subject || ""} — ${req.proposedDate || ""}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bgClass}`}>
                          {cfg.label}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-border space-y-3">
                        {isLoa ? (
                          <>
                            <div className="grid grid-cols-2 gap-3 text-sm pt-3">
                              <div>
                                <span className="text-muted-foreground">Start Date:</span>
                                <p className="font-medium">{req.startDate || "N/A"}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">End Date:</span>
                                <p className="font-medium">{req.endDate || "N/A"}</p>
                              </div>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Reason:</span>
                              <p className="mt-1 p-2 bg-muted rounded text-sm">{req.reasonForLeave || "N/A"}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-3 text-sm pt-3">
                              <div>
                                <span className="text-muted-foreground">Subject:</span>
                                <p className="font-medium">{req.subject || "N/A"}</p>
                              </div>
                              {req.subjectCode && (
                                <div>
                                  <span className="text-muted-foreground">Code:</span>
                                  <p className="font-medium">{req.subjectCode}</p>
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">Original Date:</span>
                                <p className="font-medium">{req.originalDate || "N/A"}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Original Time:</span>
                                <p className="font-medium">{req.originalTime || "N/A"}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Proposed Date:</span>
                                <p className="font-medium">{req.proposedDate || "N/A"}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Proposed Time:</span>
                                <p className="font-medium">{req.proposedTime || "N/A"}</p>
                              </div>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Reason:</span>
                              <p className="mt-1 p-2 bg-muted rounded text-sm">{req.reasonForMakeUp || "N/A"}</p>
                            </div>
                          </>
                        )}

                        {req.adminResponse && (
                          <div className="text-sm">
                            <span className="text-muted-foreground font-medium">Admin Response:</span>
                            <p className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                              {req.adminResponse}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                          <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                          {req.respondedAt && (
                            <span>Responded: {new Date(req.respondedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}