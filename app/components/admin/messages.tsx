"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { messagingService } from "@/app/services/messaging-service"
import { useState, useEffect } from "react"
import { formatDate } from "@/lib/formatters"
import { userStorage } from "@/lib/storage"

export const AdminMessages = () => {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)

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

  const selectedMsg = messages.find((m) => m.id === selectedMessage)

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Messages</h1>
        <p className="text-muted-foreground">View and reply to inquiries from students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>{messages.length} messages</CardDescription>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
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
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Message Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMsg ? (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
