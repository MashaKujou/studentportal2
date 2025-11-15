"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/app/contexts/auth-context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "student") {
        router.push("/student/dashboard")
      } else if (user.role === "teacher") {
        router.push("/teacher/dashboard")
      } else if (user.role === "admin") {
        router.push("/admin/dashboard")
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="inline-flex space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background">
      <nav className="bg-primary text-primary-foreground shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Student Portal</h1>
          <div className="flex gap-2">
            <Link href="/login">
              <Button
                variant="outline"
                className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              >
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">Register</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Student Portal</h2>
          <p className="text-xl text-muted-foreground mb-8">Manage your academic life in one place</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>For Students</CardTitle>
              <CardDescription>Track grades, attendance, and more</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Access your grades, attendance records, schedule, and submit document requests.
              </p>
              <Link href="/login">
                <Button className="w-full">Student Login</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Teachers</CardTitle>
              <CardDescription>Manage classes and grades</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Input grades, mark attendance, upload materials, and view class analytics.
              </p>
              <Link href="/login">
                <Button className="w-full">Teacher Login</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Administrators</CardTitle>
              <CardDescription>Manage the system</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Approve registrations, manage users, and view system analytics.
              </p>
              <Link href="/login">
                <Button className="w-full">Admin Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Student Features</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• View and track grades</li>
                  <li>• Monitor attendance</li>
                  <li>• Check class schedule</li>
                  <li>• Download documents</li>
                  <li>• Submit requests</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Teacher Features</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Input student grades</li>
                  <li>• Mark attendance</li>
                  <li>• Upload materials</li>
                  <li>• View class analytics</li>
                  <li>• Manage classes</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Admin Features</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Approve registrations</li>
                  <li>• Manage all users</li>
                  <li>• View analytics</li>
                  <li>• Process requests</li>
                  <li>• System settings</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Communication</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Send messages</li>
                  <li>• Notifications</li>
                  <li>• Request tracking</li>
                  <li>• Admin inquiries</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">Don't have an account?</p>
          <Link href="/register">
            <Button size="lg">Register Now</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
