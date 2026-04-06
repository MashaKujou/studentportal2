'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  analyticsService,
} from '@/app/services/analytics-service'
import { Users, BookOpen, Building2, MessageSquare, TrendingUp, PieChart } from 'lucide-react'

export function AdvancedAnalytics() {
  const [studentAnalytics, setStudentAnalytics] = useState<any>(null)
  const [financialAnalytics, setFinancialAnalytics] = useState<any>(null)
  const [libraryAnalytics, setLibraryAnalytics] = useState<any>(null)
  const [campusAnalytics, setCampusAnalytics] = useState<any>(null)
  const [feedbackAnalytics, setFeedbackAnalytics] = useState<any>(null)
  const [systemAnalytics, setSystemAnalytics] = useState<any>(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = () => {
    setStudentAnalytics(analyticsService.getStudentAnalytics())
    setFinancialAnalytics(analyticsService.getFinancialAnalytics())
    setLibraryAnalytics(analyticsService.getLibraryAnalytics())
    setCampusAnalytics(analyticsService.getCampusAnalytics())
    setFeedbackAnalytics(analyticsService.getFeedbackAnalytics())
    setSystemAnalytics(analyticsService.getSystemAnalytics())
  }

  if (!studentAnalytics) return <div>Loading analytics...</div>

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="students">Students</TabsTrigger>
        <TabsTrigger value="financial">Financial</TabsTrigger>
        <TabsTrigger value="library">Library</TabsTrigger>
        <TabsTrigger value="campus">Campus</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemAnalytics.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {systemAnalytics.totalStudents} students, {systemAnalytics.totalTeachers} teachers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Unread Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{systemAnalytics.unreadMessages}</div>
              <p className="text-xs text-muted-foreground mt-1">of {systemAnalytics.totalMessages} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="bg-green-600">
                {systemAnalytics.systemHealth}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Student Distribution by Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(studentAnalytics.studentsByLevel).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground capitalize">{level}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{
                            width: `${(count as number / studentAnalytics.totalStudents) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Registration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(studentAnalytics.studentsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground capitalize">{status}</span>
                    <Badge
                      className={`${
                        status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="students" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{studentAnalytics.totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{studentAnalytics.approvedStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{studentAnalytics.pendingStudents}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Attendance Rate</span>
              <span className="text-2xl font-bold text-green-600">{studentAnalytics.averageAttendanceRate}%</span>
            </div>
            <div className="space-y-2">
              {Object.entries(studentAnalytics.attendanceByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">{status}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="financial" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tuition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{financialAnalytics.totalTuition.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₱{financialAnalytics.totalPaid.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Balance Owed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₱{financialAnalytics.balanceOwed.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Collection Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{financialAnalytics.collectionRate}%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(financialAnalytics.paymentsByMethod).map(([method, amount]) => (
                <div key={method} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">{method.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-medium">₱{(amount as number).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="library" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Books</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{libraryAnalytics.totalBooks}</div>
              <p className="text-xs text-muted-foreground mt-1">{libraryAnalytics.totalCopies} copies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{libraryAnalytics.availableCopies}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Checkouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{libraryAnalytics.activeCheckouts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{libraryAnalytics.overdueCheckouts}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Utilization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{libraryAnalytics.utilizationRate}%</div>
              <p className="text-sm text-muted-foreground">
                {libraryAnalytics.borrowedCopies} of {libraryAnalytics.totalCopies} copies currently borrowed
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="campus" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campusAnalytics.totalFacilities}</div>
              <p className="text-xs text-muted-foreground mt-1">{campusAnalytics.availableFacilities} available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{campusAnalytics.maintenanceFacilities}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campusAnalytics.totalBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{campusAnalytics.pendingBookings}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(campusAnalytics.bookingsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">{status}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="feedback" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedbackAnalytics.totalFeedback}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Responded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{feedbackAnalytics.respondedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedbackAnalytics.responseRate}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{feedbackAnalytics.newFeedback}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Feedback by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(feedbackAnalytics.byCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground capitalize">{category.replace(/_/g, ' ')}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedback by Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(feedbackAnalytics.byPriority).map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground capitalize">{priority}</span>
                    <Badge
                      className={
                        priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }
                    >
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
