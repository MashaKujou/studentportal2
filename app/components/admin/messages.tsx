"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { messagingService } from "@/app/services/messaging-service"
import { useState, useEffect } from "react"
import { formatDate } from "@/lib/formatters"
import { requestMessagesStorage, userStorage } from "@/lib/storage"
import { studentService } from "@/app/services/student-service"
import { ArrowRight } from "lucide-react"
import { useSearchParams } from "next/navigation"

export const AdminMessages = () => {
  const searchParams = useSearchParams()
  const requestIdFromUrl = searchParams.get("requestId")

  const [mode, setMode] = useState<"inbox" | "requests">(requestIdFromUrl ? "requests" : "inbox")
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(requestIdFromUrl)
  const [requestChats, setRequestChats] = useState<any[]>([])
  const [requestReplyText, setRequestReplyText] = useState("")

  useEffect(() => {
    const fetchMessages = () => {
      const inbox = messagingService.getInbox("ADMIN") || []
      // Get sender info for each message
      const messagesWithSender = inbox.map((msg) => {
        const students = userStorage.getStudents()
        const sender = students.find((s) => s.id === msg.senderId)
        return {
          ...msg,
          senderName: sender ? `${sender.firstName} ${sender.lastName}` : "Unknown Student",
          senderEmail: sender?.email || "N/A",
        }
      })
      setMessages(messagesWithSender)
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchRequestChats = () => {
      const allRequests = studentService.getAllRequests()
      const students = userStorage.getStudents()
      const studentById = new Map(students.map((s) => [s.id, s]))

      const hydrated = allRequests.map((req) => {
        const student = studentById.get(req.studentId)
        return {
          ...req,
          studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown Student",
          studentEmail: student?.email || "N/A",
          lastMessageAt:
            requestMessagesStorage.getByRequestId(req.id).slice(-1)[0]?.createdAt || req.createdAt,
        }
      })

      hydrated.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
      setRequestChats(hydrated)
    }

    fetchRequestChats()
    const interval = setInterval(fetchRequestChats, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!requestIdFromUrl) return
    setMode("requests")
    setSelectedRequestId(requestIdFromUrl)
  }, [requestIdFromUrl])

  const selectedMsg = messages.find((m) => m.id === selectedMessage)
  const selectedRequest = requestChats.find((r) => r.id === selectedRequestId)
  const selectedRequestMessages = selectedRequestId ? requestMessagesStorage.getByRequestId(selectedRequestId) : []

  const handleReply = async () => {
    if (!selectedMsg || !replyText.trim()) return

    setSending(true)
    try {
      messagingService.sendMessage({
        senderId: "ADMIN",
        receiverId: selectedMsg.senderId,
        subject: `Re: ${selectedMsg.subject}`,
        content: replyText,
      })
      setReplyText("")
      alert("Reply sent successfully!")
    } catch (error) {
      alert("Failed to send reply")
    } finally {
      setSending(false)
    }
  }

  const handleRequestReply = async () => {
    if (!selectedRequestId || !requestReplyText.trim()) return
    setSending(true)
    try {
      requestMessagesStorage.add({
        requestId: selectedRequestId,
        senderId: "admin",
        senderRole: "admin",
        message: requestReplyText.trim(),
      })
      setRequestReplyText("")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Messages</h1>
        <p className="text-muted-foreground">View and reply to inquiries and request chats</p>
      </div>

      <div className="flex gap-2">
        <Button variant={mode === "inbox" ? "default" : "outline"} onClick={() => setMode("inbox")}>
          Inbox
        </Button>
        <Button variant={mode === "requests" ? "default" : "outline"} onClick={() => setMode("requests")}>
          Request Chats
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{mode === "inbox" ? "Inbox" : "Requests"}</CardTitle>
            <CardDescription>
              {mode === "inbox" ? `${messages.length} messages` : `${requestChats.length} request(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === "inbox" ? (
              messages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No messages</p>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg.id)}
                      className={`w-full text-left p-3 rounded-lg border ${
                        selectedMessage === msg.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <p className="font-semibold text-sm">{msg.senderName}</p>
                      <p className="font-sm text-sm truncate opacity-75">{msg.subject}</p>
                      <p className="text-xs opacity-75">{formatDate(msg.createdAt)}</p>
                    </button>
                  ))}
                </div>
              )
            ) : requestChats.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No requests</p>
            ) : (
              <div className="space-y-2">
                {requestChats.map((req) => (
                  <button
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className={`w-full text-left p-3 rounded-lg border ${
                      selectedRequestId === req.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <p className="font-semibold text-sm">{req.studentName}</p>
                    <p className="text-sm truncate opacity-75">{req.type}</p>
                    <p className="text-xs opacity-75">{formatDate(req.createdAt)}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{mode === "inbox" ? "Message Details" : "Request Chat"}</CardTitle>
          </CardHeader>
          <CardContent>
            {mode === "inbox" ? (
              selectedMsg ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-semibold">{selectedMsg.senderName}</p>
                  <p className="text-sm text-muted-foreground">{selectedMsg.senderEmail}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-semibold">{selectedMsg.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{formatDate(selectedMsg.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Message</p>
                  <p className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">{selectedMsg.content}</p>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <p className="text-sm font-semibold">Reply to Student</p>
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleReply} disabled={sending || !replyText.trim()}>
                      {sending ? "Sending..." : "Send Reply"}
                    </Button>
                    <Button variant="outline" onClick={() => messagingService.markAsRead(selectedMsg.id)}>
                      Mark as Read
                    </Button>
                  </div>
                </div>
              </div>
              ) : (
                <p className="text-muted-foreground text-center py-12">Select a message to view</p>
              )
            ) : selectedRequest ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="font-semibold">{selectedRequest.studentName}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.studentEmail}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Request</p>
                  <p className="font-semibold">{selectedRequest.type}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.reason}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Messages</p>
                  <div className="bg-muted p-3 rounded max-h-64 overflow-y-auto text-sm space-y-2">
                    {selectedRequestMessages.length === 0 ? (
                      <p className="text-muted-foreground text-center py-6">No messages yet</p>
                    ) : (
                      selectedRequestMessages.map((msg: any) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg ${
                            msg.senderRole === "admin" ? "bg-primary/10 ml-6" : "bg-secondary mr-6"
                          }`}
                        >
                          <p className="text-xs font-semibold opacity-70">
                            {msg.senderRole === "admin" ? "Admin" : "Student"}
                          </p>
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          <p className="text-xs opacity-60 mt-1">{formatDate(msg.createdAt)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Textarea
                    placeholder="Type a message..."
                    value={requestReplyText}
                    onChange={(e) => setRequestReplyText(e.target.value)}
                    className="min-h-20 flex-1"
                  />
                  <Button
                    onClick={handleRequestReply}
                    disabled={sending || !requestReplyText.trim()}
                    className="h-10 w-10 rounded-full p-0 self-center"
                    aria-label="Send message"
                    title="Send"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">Select a request to view</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
