'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { notificationService, Notification } from '@/app/services/notification-service'
import { useAuth } from '@/app/contexts/auth-context'
import { Bell, Archive, Trash2, CheckCircle2 } from 'lucide-react'

export function StudentNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read' | 'archived'>('all')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user])

  const loadNotifications = () => {
    if (!user) return
    const allNotifications = notificationService.getNotifications(user.id)
    setNotifications(allNotifications)
    setUnreadCount(notificationService.getUnreadCount(user.id))
  }

  const handleMarkAsRead = (notifId: string) => {
    notificationService.markAsRead(notifId)
    loadNotifications()
  }

  const handleArchive = (notifId: string) => {
    notificationService.markAsArchived(notifId)
    loadNotifications()
  }

  const handleDelete = (notifId: string) => {
    notificationService.deleteNotification(notifId)
    loadNotifications()
  }

  const handleClearArchived = () => {
    if (!user) return
    notificationService.clearArchived(user.id)
    loadNotifications()
  }

  const filteredNotifications = notifications.filter((notif) => {
    if (filterStatus === 'all') return true
    return notif.status === filterStatus
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return '⏰'
      case 'schedule_change':
        return '📅'
      case 'payment_due':
        return '💳'
      case 'grade_posted':
        return '📊'
      case 'registration_open':
        return '📝'
      case 'event':
        return '🎉'
      default:
        return '🔔'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'bg-red-100 text-red-800'
      case 'payment_due':
        return 'bg-orange-100 text-orange-800'
      case 'grade_posted':
        return 'bg-green-100 text-green-800'
      case 'registration_open':
        return 'bg-blue-100 text-blue-800'
      case 'event':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('all')}
          size="sm"
        >
          All
        </Button>
        <Button
          variant={filterStatus === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('unread')}
          size="sm"
        >
          Unread
        </Button>
        <Button
          variant={filterStatus === 'read' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('read')}
          size="sm"
        >
          Read
        </Button>
        <Button
          variant={filterStatus === 'archived' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('archived')}
          size="sm"
        >
          Archived
        </Button>
      </div>

      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {filterStatus === 'all' && "You don't have any notifications yet"}
              {filterStatus === 'unread' && 'You have no unread notifications'}
              {filterStatus === 'read' && 'You have no read notifications'}
              {filterStatus === 'archived' && 'You have no archived notifications'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={`cursor-pointer transition-all ${
                notif.status === 'unread' ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex gap-3 items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="text-2xl">{getNotificationIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-sm">{notif.title}</h3>
                        <Badge className={`text-xs ${getTypeColor(notif.type)}`}>
                          {notif.type.replace(/_/g, ' ')}
                        </Badge>
                        {notif.status === 'unread' && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    {notif.status === 'unread' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notif.id)}
                        title="Mark as read"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchive(notif.id)}
                      title="Archive"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notif.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filterStatus === 'archived' && filteredNotifications.length > 0 && (
        <Button variant="outline" onClick={handleClearArchived} className="w-full">
          Clear All Archived
        </Button>
      )}
    </div>
  )
}
