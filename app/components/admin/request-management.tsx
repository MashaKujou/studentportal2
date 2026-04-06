"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { userStorage } from "@/lib/storage"
import { useMemo, useState } from "react"
import { formatDate } from "@/lib/formatters"
import { REQUEST_TYPES_COLLEGE } from "@/lib/constants"
import { Download, FileText } from 'lucide-react'
import { studentService } from "@/app/services/student-service"

const statusMessages: { [key: string]: string } = {
  pending: "Your Request is still Pending",
  read: "Your Request has been read by admin",
  in_progress: "Your Request has been viewed by admin and in Progress",
  completed: "Your Request has been Completed pick it up on Registrar",
  rejected: "I'm sorry but your Request is Rejected",
}

export const RequestManagement = () => {
  const [filterStatus, setFilterStatus] = useState("pending")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [newRequestType, setNewRequestType] = useState("")
  const [selectedStudent, setSelectedStudent] = useState("")
  const [showAddRequest, setShowAddRequest] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showDocuments, setShowDocuments] = useState(false)
  const [documentTypeFilter, setDocumentTypeFilter] = useState("all")
  const [academicLevelFilter, setAcademicLevelFilter] = useState("all")

  const requests = useMemo(() => {
    // Placeholder for requests - since we're using localStorage only
    // Return empty array or implement localStorage-based request storage
    return []
  }, [filterStatus, refreshKey])

  const students = useMemo(() => {
    return userStorage.getStudents()
  }, [])

  const allDocuments = useMemo(() => {
    const students = userStorage.getStudents()
    let docs: any[] = []
    
    students.forEach(student => {
      const studentDocs = studentService.getDocuments(student.id)
      studentDocs.forEach((doc: any) => {
        docs.push({
          ...doc,
          studentName: `${student.firstName} ${student.lastName}`,
          studentEmail: student.email,
          academicLevel: student.academicLevel,
          course: student.course || student.strand,
          year: student.year || student.grade
        })
      })
    })

    if (documentTypeFilter !== "all") {
      docs = docs.filter(doc => doc.type === documentTypeFilter)
    }
    if (academicLevelFilter !== "all") {
      docs = docs.filter(doc => doc.academicLevel === academicLevelFilter)
    }

    return docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  }, [refreshKey, documentTypeFilter, academicLevelFilter])

  const documentTypes = ["Transcript", "Certificate", "Transfer Certificate", "Leave Letter", "Identity Card Photo", "Admission Letter"]

  const handleSelectRequest = (req: any) => {
    // Placeholder implementation - requests not implemented yet
    setSelectedRequest(req)
    setRefreshKey((k) => k + 1)
  }

  const handleReply = () => {
    // Placeholder implementation - requests not implemented yet
    setReplyMessage("")
  }

  const handleStatusChange = (newStatus: string) => {
    // Placeholder implementation - requests not implemented yet
    setRefreshKey((k) => k + 1)
    setSelectedRequest(null)
  }

  const handleAddRequest = () => {
    // Placeholder implementation - requests not implemented yet
    setNewRequestType("")
    setSelectedStudent("")
    setShowAddRequest(false)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Request Management</h1>
          <p className="text-muted-foreground">Process student document requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDocuments(!showDocuments)}>
            <FileText className="w-4 h-4 mr-2" />
            {showDocuments ? "View Requests" : "View Documents"}
          </Button>
          <Button onClick={() => setShowAddRequest(!showAddRequest)}>Add Request</Button>
        </div>
      </div>

      {showDocuments ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Documents</CardTitle>
              <CardDescription>View and filter all uploaded documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Filter by Document Type</label>
                  <select
                    value={documentTypeFilter}
                    onChange={(e) => setDocumentTypeFilter(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="all">All Types</option>
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Filter by Academic Level</label>
                  <select
                    value={academicLevelFilter}
                    onChange={(e) => setAcademicLevelFilter(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="all">All Levels</option>
                    <option value="senior_high">Senior High</option>
                    <option value="diploma">Diploma</option>
                    <option value="bachelor">Bachelor</option>
                  </select>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Document Name</th>
                        <th className="text-left p-3 font-semibold">Type</th>
                        <th className="text-left p-3 font-semibold">Student</th>
                        <th className="text-left p-3 font-semibold">Academic Level</th>
                        <th className="text-left p-3 font-semibold">Course/Strand</th>
                        <th className="text-left p-3 font-semibold">Upload Date</th>
                        <th className="text-left p-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allDocuments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-muted-foreground">
                            No documents found
                          </td>
                        </tr>
                      ) : (
                        allDocuments.map((doc) => (
                          <tr key={doc.id} className="border-t hover:bg-muted/50">
                            <td className="p-3">{doc.name}</td>
                            <td className="p-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                {doc.type}
                              </span>
                            </td>
                            <td className="p-3">
                              <div>
                                <p className="font-medium">{doc.studentName}</p>
                                <p className="text-xs text-muted-foreground">{doc.studentEmail}</p>
                              </div>
                            </td>
                            <td className="p-3 capitalize">{doc.academicLevel.replace('_', ' ')}</td>
                            <td className="p-3">{doc.course || 'N/A'} - Year {doc.year || 'N/A'}</td>
                            <td className="p-3">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                            <td className="p-3">
                              <a href={doc.url} download={doc.name}>
                                <Button size="sm" variant="outline">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Showing {allDocuments.length} document(s)
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {showAddRequest && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle>Create Request for Student</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.email})
                    </option>
                  ))}
                </select>
                <select
                  value={newRequestType}
                  onChange={(e) => setNewRequestType(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Request Type</option>
                  {REQUEST_TYPES_COLLEGE.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button onClick={handleAddRequest} className="bg-green-600 hover:bg-green-700">
                    Create
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddRequest(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 overflow-x-auto">
            {["pending", "read", "in_progress", "completed", "rejected"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                onClick={() => setFilterStatus(status)}
                className="whitespace-nowrap"
              >
                {status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Requests</CardTitle>
                <CardDescription>
                  {requests.length} {filterStatus} request(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No {filterStatus} requests</p>
                ) : (
                  <div className="space-y-2">
                    {requests.map((req) => (
                      <div
                        key={req.id}
                        onClick={() => handleSelectRequest(req)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedRequest?.id === req.id ? "bg-blue-100 border-blue-500" : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">{req.type}</p>
                            <p className="text-sm text-muted-foreground">{req.studentName}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(req.createdAt)}</p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              req.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : req.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : req.status === "in_progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {req.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedRequest && (
              <Card>
                <CardHeader>
                  <CardTitle>Request Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Student:</p>
                    <p className="text-sm">{selectedRequest.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Type:</p>
                    <p className="text-sm">{selectedRequest.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reason/Details:</p>
                    <div className="text-sm bg-gray-50 p-3 rounded border border-gray-200">
                      {selectedRequest.reason || "No details provided"}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status Note:</p>
                    <p className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
                      {statusMessages[selectedRequest.status] || "Status unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Change Status:</p>
                    <select
                      value={selectedRequest.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="read">Read</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Messages:</p>
                    <div className="bg-muted p-3 rounded max-h-32 overflow-y-auto text-xs space-y-2">
                      {[].map((msg: any) => (
                        <div key={msg.id}>
                          <p className="font-semibold capitalize">{msg.senderRole}:</p>
                          <p>{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Reply to request..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="min-h-20"
                  />
                  <Button onClick={handleReply} className="w-full">
                    Send Reply
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}
