"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

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
  
  const [isRadialOpen, setIsRadialOpen] = useState(false)

  // Close radial menu when pathname changes
  useEffect(() => {
    setIsRadialOpen(false)
  }, [pathname])

  const handleMouseEnter = (e: React.MouseEvent, label: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top,
      label,
    })
  }

  const handleMouseLeave = () => setTooltip(null)

  const toggleRadial = () => setIsRadialOpen(!isRadialOpen)

  // Radial menu radius
  const radius = 120

  return (
    <>
      {/* Tooltip — rendered at root level, uses fixed coords directly */}
      {tooltip && (
        <div
          className="fixed z-[99999] pointer-events-none hidden md:block"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: "translate(-50%, calc(-100% - 12px))",
          }}
        >
          <div className="relative bg-foreground text-background text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl animate-in fade-in zoom-in-95 duration-150">
            {tooltip.label}
            <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-foreground" />
          </div>
        </div>
      )}

      {/* Desktop Navigation (hidden on mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-40 hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center gap-2 py-3 overflow-x-auto">
            {items.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                  onMouseLeave={handleMouseLeave}
                  className="relative flex flex-col items-center justify-center min-w-[70px] px-2 py-2 transition-all duration-200"
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${isActive
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

      {/* Mobile Radial Navigation (hidden on desktop) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="relative flex items-center justify-center">
          {/* Menu Items */}
          {items.map((item, index) => {
            const isActive = pathname === item.href
            
            // Calculate angle for semi-circle (180 degrees from left to right)
            // Left is 180 (PI), Right is 0. We map index 0 to PI, and max index to 0.
            const angle = Math.PI - (index * Math.PI) / Math.max(1, items.length - 1)
            
            // Calculate X and Y translations based on angle and radius
            const tx = isRadialOpen ? Math.cos(angle) * radius : 0
            const ty = isRadialOpen ? -Math.sin(angle) * radius : 0

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group absolute flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isActive
                    ? "bg-primary text-primary-foreground scale-110 z-10"
                    : "bg-background text-foreground border border-border hover:bg-muted z-0"
                } ${isRadialOpen ? "opacity-100" : "opacity-0 pointer-events-none scale-0"}`}
                style={{
                  transform: `translate(${tx}px, ${ty}px)`,
                  transitionDelay: `${isRadialOpen ? index * 30 : 0}ms`
                }}
              >
                {item.icon}
                <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background px-2 py-1 rounded-md shadow-md whitespace-nowrap pointer-events-none">
                  {item.label}
                </span>
              </Link>
            )
          })}
          
          {/* Main Toggle Button */}
          <button
            onClick={toggleRadial}
            className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-xl bg-primary text-primary-foreground transition-transform duration-300 z-50 hover:scale-105 active:scale-95 ${
              isRadialOpen ? "rotate-180" : ""
            }`}
          >
            {isRadialOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Overlay to close menu when clicking outside */}
      {isRadialOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
          onClick={() => setIsRadialOpen(false)}
        />
      )}
    </>
  )
}