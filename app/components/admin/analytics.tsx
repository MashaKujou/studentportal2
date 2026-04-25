'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, BookOpen, MessageSquare, TrendingUp, Award, PieChart } from 'lucide-react'

export const AdminAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview')

  // Placeholder data - analytics service removed
  const stats = {
    totalStudents: 0,
    approvedStudents: 0,
    pendingStudents: 0,
    totalTeachers: 0,
  }
  const studentAnalytics = {}
  const feedbackAnalytics = {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Analytics Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive system-wide statistics and insights</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
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
