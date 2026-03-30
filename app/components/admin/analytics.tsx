'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { analyticsService } from '@/app/services/analytics-service'
import { Users, BookOpen, MessageSquare, TrendingUp, DollarSign, Award, PieChart } from 'lucide-react'

export const AdminAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const stats = analyticsService.getSystemAnalytics()
  const studentAnalytics = analyticsService.getStudentAnalytics()
  const financialAnalytics = analyticsService.getFinancialAnalytics()
  const libraryAnalytics = analyticsService.getLibraryAnalytics()
  const feedbackAnalytics = analyticsService.getFeedbackAnalytics()
  const attendanceAnalytics = analyticsService.getAttendanceAnalytics()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Analytics Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive system-wide statistics and insights</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" /> Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                <p className="text-xs text-muted-foreground">Active users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="w-4 h-4" /> Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.approvedStudents || 0}</div>
                <p className="text-xs text-muted-foreground">Registered & verified</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats?.pendingStudents || 0}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Total Teachers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalTeachers || 0}</div>
                <p className="text-xs text-muted-foreground">Faculty members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{(financialAnalytics?.totalCollected || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total collected</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Library Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{libraryAnalytics?.totalBooks || 0}</div>
                <p className="text-xs text-muted-foreground">Books & modules</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Distribution by Level</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Senior High School:</span>
                  <span className="font-semibold">{studentAnalytics?.byLevel?.SHS || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Diploma Programs:</span>
                  <span className="font-semibold">{studentAnalytics?.byLevel?.Diploma || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bachelor Degree:</span>
                  <span className="font-semibold">{studentAnalytics?.byLevel?.Bachelor || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enrollment Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Approved:</span>
                  <Badge variant="default" className="bg-green-600">{studentAnalytics?.approved || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <Badge variant="secondary">{studentAnalytics?.pending || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Rejected:</span>
                  <Badge variant="destructive">{studentAnalytics?.rejected || 0}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Outstanding:</span>
                  <span className="font-semibold text-red-600">₱{(financialAnalytics?.outstanding || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fully Paid:</span>
                  <span className="font-semibold text-green-600">{financialAnalytics?.fullyPaid || 0} records</span>
                </div>
                <div className="flex justify-between">
                  <span>Partial Payment:</span>
                  <span className="font-semibold text-yellow-600">{financialAnalytics?.partialPayment || 0} records</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Tuition Fees:</span>
                  <span className="font-semibold">₱{(financialAnalytics?.tuitionRevenue || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Fees:</span>
                  <span className="font-semibold">₱{(financialAnalytics?.otherFeesRevenue || 0).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Library Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Available Books:</span>
                  <span className="font-semibold text-green-600">{libraryAnalytics?.available || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Currently Borrowed:</span>
                  <span className="font-semibold text-blue-600">{libraryAnalytics?.borrowed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reserved:</span>
                  <span className="font-semibold text-yellow-600">{libraryAnalytics?.reserved || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Circulation Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Checkouts (this month):</span>
                  <span className="font-semibold">{libraryAnalytics?.checkoutsThisMonth || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Loan Duration:</span>
                  <span className="font-semibold">{libraryAnalytics?.avgLoanDays || 0} days</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Records:</span>
                  <span className="font-semibold">{attendanceAnalytics?.totalRecords || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Attendance Rate:</span>
                  <span className="font-semibold text-green-600">{attendanceAnalytics?.avgRate || 0}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Present:</span>
                  <Badge variant="default" className="bg-green-600">{attendanceAnalytics?.present || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Absent:</span>
                  <Badge variant="destructive">{attendanceAnalytics?.absent || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Late:</span>
                  <Badge variant="secondary">{attendanceAnalytics?.late || 0}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Submissions:</span>
                  <span className="font-semibold">{feedbackAnalytics?.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolved:</span>
                  <span className="font-semibold text-green-600">{feedbackAnalytics?.resolved || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span className="font-semibold text-yellow-600">{feedbackAnalytics?.pending || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedback by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Bug Reports:</span>
                  <span className="font-semibold">{feedbackAnalytics?.byCategory?.bug || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Feature Requests:</span>
                  <span className="font-semibold">{feedbackAnalytics?.byCategory?.feature || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>General Feedback:</span>
                  <span className="font-semibold">{feedbackAnalytics?.byCategory?.general || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
