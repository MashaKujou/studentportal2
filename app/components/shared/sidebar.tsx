"use client"

import type React from "react"

import { useAuth } from "@/app/contexts/auth-context"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon?: string
}

interface SidebarProps {
  items: NavItem[]
}

export const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-4 right-4 p-2 bg-primary text-primary-foreground rounded-full shadow-lg z-30"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <aside
        className={`fixed md:static top-0 left-0 h-screen md:h-auto w-64 bg-sidebar text-sidebar-foreground transform transition-transform md:transform-none md:translate-x-0 z-20 border-r border-sidebar-border ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 pt-20 md:pt-4 space-y-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2 rounded-md transition-colors ${
                pathname === item.href
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent text-sidebar-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 bg-black/50 md:hidden z-10" onClick={() => setIsOpen(false)} />}
    </>
  )
}
