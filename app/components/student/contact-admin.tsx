"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/app/contexts/auth-context"
import { messagingService } from "@/app/services/messaging-service"
import { INQUIRY_CATEGORIES } from "@/lib/constants"
import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, Mail, Reply } from 'lucide-react'

export const StudentContactAdmin = () => {
  const { user } = useAuth()
  const [category, setCategory] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  useEffect(() => {
    const fetchMessages = () => {
      if (!user) return
      const allMessages = messagingService.getMessages(user.id)
      setMessages(allMessages)
    }
    
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [user])

  const handleSendMessage = async () => {
    if (!user || !category || !subject || !message.trim()) return

    setIsSubmitting(true)
    try {
      messagingService.sendMessage({
        senderId: user.id,
        receiverId: "ADMIN",
        subject: `[${category}] ${subject}`,
        content: message,
      })

      setCategory("")
      setSubject("")
      setMessage("")
      const allMessages = messagingService.getMessages(user.id)
      setMessages(allMessages)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = (originalMessage: any) => {
    if (!user || !replyText.trim()) return
    
    messagingService.sendMessage({
      senderId: user.id,
      receiverId: "ADMIN",
      subject: `Re: ${originalMessage.subject}`,
      content: replyText,
    })
    
    setReplyText("")
    const allMessages = messagingService.getMessages(user.id)
    setMessages(allMessages)
  }

  const getConversationThread = (subjectLine: string) => {
    return messages.filter(msg => 
      msg.subject === subjectLine || 
      msg.subject === `Re: ${subjectLine}` ||
      subjectLine.startsWith('Re: ') && msg.subject === subjectLine.replace('Re: ', '')
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Administration</h1>
        <p className="text-muted-foreground">Send messages or inquiries to the admin</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send Message</CardTitle>
          <CardDescription>Contact the administration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Inquiry Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="">Select a category</option>
              {INQUIRY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-2">
              Subject
            </label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Message subject"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message..."
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              rows={6}
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={isSubmitting || !category || !subject || !message}
            className="w-full h-11 font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <CardDescription>Your conversations with administration</CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No messages yet</p>
          ) : (
            <div className="space-y-2">
              {messages
                .filter(msg => msg.senderId === user?.id)
                .map((msg) => {
                  const conversation = getConversationThread(msg.subject)
                  const isExpanded = expandedMessageId === msg.id
                  const hasReplies = conversation.length > 1
                  
                  return (
                    <div key={msg.id} className="border border-border rounded-lg">
                      <button
                        onClick={() => setExpandedMessageId(isExpanded ? null : msg.id)}
                        className="w-full p-4 text-left hover:bg-muted transition-colors flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <p className="font-semibold text-sm">{msg.subject}</p>
                            {hasReplies && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {conversation.length} messages
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="border-t border-border p-4 space-y-4 bg-muted/30">
                          {/* Conversation thread */}
                          <div className="space-y-3">
                            {conversation.map((threadMsg, index) => (
                              <div
                                key={threadMsg.id}
                                className={`p-3 rounded-lg ${
                                  threadMsg.senderId === user?.id
                                    ? "bg-primary/10 ml-4"
                                    : "bg-secondary mr-4"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-semibold">
                                    {threadMsg.senderId === user?.id ? "You" : "Admin"}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(threadMsg.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{threadMsg.content}</p>
                              </div>
                            ))}
                          </div>
                          
                          {/* Reply form */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Reply className="h-4 w-4" />
                              Reply to Admin
                            </label>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your reply..."
                              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                              rows={3}
                            />
                            <Button
                              onClick={() => handleReply(msg)}
                              disabled={!replyText.trim()}
                              className="w-full h-9 font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-colors disabled:opacity-50"
                            >
                              Send Reply
                            </Button>
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
