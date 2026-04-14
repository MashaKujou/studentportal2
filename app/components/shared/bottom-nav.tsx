"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

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
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    label: string
  } | null>(null)

  const handleMouseEnter = (e: React.MouseEvent, label: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top,
      label,
    })
  }

  const handleMouseLeave = () => setTooltip(null)

  return (
    <>
      {/* Tooltip — rendered at root level, uses fixed coords directly */}
      {tooltip && (
        <div
          className="fixed z-[99999] pointer-events-none"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: "translate(-50%, calc(-100% - 12px))",
          }}
        >
          <div className="relative bg-foreground text-background text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl animate-in fade-in zoom-in-95 duration-150">
            {tooltip.label}
            {/* Proper CSS triangle arrow — no rotation glitches */}
            <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-foreground" />
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex justify-around md:justify-start md:gap-1 py-2 sm:py-3 overflow-x-auto">
            {items.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                  onMouseLeave={handleMouseLeave}
                  className="relative flex flex-col items-center justify-center min-w-[60px] sm:min-w-[70px] px-2 py-2 transition-all duration-200"
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-all duration-200 ${isActive
                        ? "bg-primary text-primary-foreground shadow-lg scale-110"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                  >
                    {item.icon}
                  </div>

                  {isActive && (
                    <div className="absolute bottom-0 w-full h-1 bg-primary rounded-t-lg" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}