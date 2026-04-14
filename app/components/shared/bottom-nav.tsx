"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface BottomNavProps {
  items: NavItem[]
}

export const BottomNav: React.FC<BottomNavProps> = ({ items }) => {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* IMPORTANT: overflow-y-visible added */}
        <div className="flex justify-around md:justify-start md:gap-1 py-2 sm:py-3 overflow-x-auto overflow-y-visible">

          {items.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col items-center justify-center min-w-[60px] sm:min-w-[70px] px-2 py-2 transition-all duration-200"
              >
                {/* Icon */}
                <div
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-all duration-200 ${isActive
                      ? "bg-primary text-primary-foreground shadow-lg scale-110"
                      : "text-muted-foreground group-hover:text-foreground group-hover:bg-muted/50"
                    }`}
                >
                  {item.icon}
                </div>

                {/* ✅ Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[88888] pointer-events-none">
                  <div className="bg-foreground text-background text-xs font-semibold px-2.5 py-1.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 shadow-lg">
                    {item.label}
                  </div>

                  {/* Tooltip arrow */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-foreground rotate-45 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 w-full h-1 bg-primary rounded-t-lg" />
                )}
              </Link>
            )
          })}

        </div>
      </div>
    </nav>
  )
}
