"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="max-w-md w-full text-center shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-6">
              <FileQuestion className="w-16 h-16 text-destructive" />
            </div>
          </div>
          <div className="text-8xl font-bold text-muted-foreground">404</div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription className="text-base">
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full" size="lg">
              Return to Home
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full" size="lg">
              Go to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
