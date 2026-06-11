"use client"

import type React from "react"

import { useAuth } from "@/app/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loading } from "./loading"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (!isLoading && user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.push("/")
    }
  }, [user, isLoading, router, allowedRoles])

  if (isLoading) {
    return <Loading />
  }

  if (!user) {
    return null
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
