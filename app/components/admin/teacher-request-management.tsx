"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { teacherRequestsStorage, type TeacherRequest } from "@/lib/storage"
import { messagingService } from "@/app/services/messaging-service"
import { TEACHER_REQUEST_TYPES } from "@/lib/constants"
import { CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, Search } from "lucide-react"

const statusChip: Record<string, { bg: string; label: string }> = {
  pending: { bg: "bg-yellow-100 text-yellow-800", label: "Pending" },
  approved: { bg: "bg-green-100 text-green-800", label: "Approved" },
  rejected: { bg: "bg-red-100 text-red-800", label: "Rejected" },
}

const typeLabel: Record<string, string> = {
  leave_of_absence: "Leave of Absence",
  make_up_class: "Make Up Class",
}

export const TeacherRequestManagement = () => {
  const [requests, setRequests] = useState<TeacherRequest[]>([])
  const [filterStatus, setFilterStatus] = useState<string>("pending")
  const [filterType, setFilterType] = useState<string>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [adminResponse, setAdminResponse] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadRequests = useCallback(() => {
    const all = teacherRequestsStorage.getAll()
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setRequests(all)
  }, [])

  useEffect(() => {
    loadRequests()
    const interval = setInterval(() => setRefreshKey((k) => k + 1), 3000)
    return () => clearInterval(interval)
  }, [loadRequests])

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (filterStatus !== "all" && r.status !== filterStatus) return false
      if (filterType !== "all" && r.type !== filterType) return false
      return true
    })
  }, [requests, filterStatus, filterType])

  const selected = selectedId ? requests.find((r) => r.id === selectedId) : null

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setAdminResponse("")
  }

  const handleApprove = async () => {
    if (!selected) return
    setIsProcessing(true)
    try {
      teacherRequestsStorage.updateStatus(selected.id, "approved", adminResponse.trim() || undefined, "admin")
      // Notify the teacher
      messagingService.createNotification({
        userId: selected.teacherId,
        type: "success",
        title: "Request Approved",
        message: `Your ${typeLabel[selected.type]} request has been approved.${
          adminResponse.trim() ? ` Admin note: ${adminResponse.trim()}` : ""
        }`,
        targetPath: "/teacher/requests",
      })
      setAdminResponse("")
      loadRequests()
    } catch (err) {
      console.error("Failed to approve request:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selected) return
    if (!adminResponse.trim()) {
      alert("Please provide a reason for rejection.")
      return
    }
    setIsProcessing(true)
    try {
      teacherRequestsStorage.updateStatus(selected.id, "rejected", adminResponse.trim(), "admin")
      // Notify the teacher
      messagingService.createNotification({
        userId: selected.teacherId,
        type: "error",
        title: "Request Rejected",
        message: `Your ${typeLabel[selected.type]} request has been rejected. Reason: ${adminResponse.trim()}`,
        targetPath: "/teacher/requests",
      })
      setAdminResponse("")
      loadRequests()
    } catch (err) {
      console.error("Failed to reject request:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const stats = useMemo(() => {
    return {
      pending: requests.filter((r) => r.status === "pending").length,
      approved: requests.filter((r) => r.status === "approved").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
      total: requests.length,
    }
  }, [requests])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teacher Request Management</h1>
        <p className="text-muted-foreground">Review and process teacher leave of absence &amp; make up class requests</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
            <p className="text-xs text-yellow-700">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
            <p className="text-xs text-green-700">Approved</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
            <p className="text-xs text-red-700">Rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — list */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle>Requests</CardTitle>
                <CardDescription>{filtered.length} request(s)</CardDescription>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {["all", "pending", "approved", "rejected"].map((s) => (
                  <Button
                    key={s}
                    variant={filterStatus === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(s)}
                    className="whitespace-nowrap"
                  >
                    {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            {/* Type filter */}
            <div className="flex gap-2 mt-2">
              {["all", "leave_of_absence", "make_up_class"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filterType === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t === "all" ? "All Types" : t === "leave_of_absence" ? "Leave of Absence" : "Make Up Class"}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No requests match the current filters.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((req) => {
                  const chip = statusChip[req.status] || statusChip.pending
                  return (
                    <button
                      key={req.id}
                      onClick={() => handleSelect(req.id)}
                      className={`w-full text-left p-3 border rounded-lg transition-colors ${
                        selectedId === req.id
                          ? "bg-blue-100 border-blue-500"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm">{typeLabel[req.type] || req.type}</p>
                          <p className="text-xs text-muted-foreground truncate">{req.teacherName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${chip.bg}`}>
                          {chip.label}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column — details */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <p className="text-muted-foreground text-sm text-center py-8">Select a request to view details</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Type</p>
                  <p className="font-semibold">{typeLabel[selected.type] || selected.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Teacher</p>
                  <p className="font-medium">{selected.teacherName}</p>
                </div>

                {selected.type === "leave_of_absence" ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Start Date</p>
                        <p className="font-medium">{selected.startDate || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">End Date</p>
                        <p className="font-medium">{selected.endDate || "N/A"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Reason</p>
                      <div className="mt-1 p-2 bg-muted rounded text-sm">
                        {selected.reasonForLeave || "No reason provided"}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Subject</p>
                      <p className="font-medium">{selected.subject || "N/A"}</p>
                      {selected.subjectCode && (
                        <p className="text-xs text-muted-foreground">Code: {selected.subjectCode}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Original Date</p>
                        <p className="font-medium">{selected.originalDate || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Original Time</p>
                        <p className="font-medium">{selected.originalTime || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Proposed Date</p>
                        <p className="font-medium">{selected.proposedDate || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Proposed Time</p>
                        <p className="font-medium">{selected.proposedTime || "N/A"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Reason</p>
                      <div className="mt-1 p-2 bg-muted rounded text-sm">
                        {selected.reasonForMakeUp || "No reason provided"}
                      </div>
                    </div>
                  </>
                )}

                {selected.adminResponse && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Admin Response</p>
                    <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                      {selected.adminResponse}
                    </div>
                  </div>
                )}

                {selected.respondedAt && (
                  <p className="text-xs text-muted-foreground">
                    Responded: {new Date(selected.respondedAt).toLocaleDateString()}
                  </p>
                )}

                {/* Actions — only for pending */}
                {selected.status === "pending" && (
                  <div className="space-y-3 pt-2 border-t">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Response Note {selected.type === "rejected" ? "(required for rejection)" : "(optional)"}
                      </label>
                      <Textarea
                        placeholder={
                          selected.type === "leave_of_absence"
                            ? "Add notes about the leave approval or rejection..."
                            : "Add notes about the make-up class schedule..."
                        }
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={handleReject}
                        disabled={isProcessing || !adminResponse.trim()}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}