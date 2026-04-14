"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"

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
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = (e: React.MouseEvent, label: string) => {
    if (containerRef.current) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const containerRect = containerRef.current.getBoundingClientRect()

      setTooltipPos({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 10,
      })
      setHoveredLabel(label)
    }
  }

  const handleMouseLeave = () => {
    setHoveredLabel(null)
    setTooltipPos(null)
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Floating Tooltip */}
      {hoveredLabel && tooltipPos && (
        <div
          className="fixed z-[88888] pointer-events-none"
          style={{
            left: `${tooltipPos.x + containerRef.current!.getBoundingClientRect().left}px`,
            top: `${tooltipPos.y + window.scrollY}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-foreground text-background text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {hoveredLabel}
            <div className="absolute left-1/2 top-full -translate-x-1/2 w-2 h-2 bg-foreground rotate-45 -mt-1"></div>
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
                  {/* Icon */}
                  <div
                    className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg scale-110"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {item.icon}
                  </div>

                  {/* Active indicator */}
                  {isActive && <div className="absolute bottom-0 w-full h-1 bg-primary rounded-t-lg" />}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
