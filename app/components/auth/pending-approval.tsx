"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const PendingApproval = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Pending Approval</CardTitle>
        <CardDescription>Your registration is being reviewed</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            Thank you for registering! Your account has been submitted for approval. An administrator will review your
            registration and contact you within 24-48 hours.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm">What happens next?</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Admin reviews your information</li>
            <li>You'll receive an approval or rejection email</li>
            <li>Once approved, you can log in to your account</li>
          </ul>
        </div>

        <Link href="/login">
          <Button className="w-full h-10 font-medium text-foreground hover:bg-muted transition-colors">
            Back to Login
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
