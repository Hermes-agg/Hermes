"use client"

import {  useEffect, useState } from "react"
import { MoonStar, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const root = document.documentElement
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const dark = stored === "dark" || (!stored && prefersDark)
    setIsDark(dark)
    root.classList.toggle("dark", dark)
  }, [])

  const handleToggle = () => {
    const newDark = !isDark
    setIsDark(newDark)
    document.documentElement.classList.toggle("dark", newDark)
    localStorage.setItem("theme", newDark ? "dark" : "light")
  }

  return (
    <button
      onClick={handleToggle}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      className={cn(
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        className
      )}
    >
      <div className="relative flex items-center justify-center w-14 h-7 bg-primary/10 border border-border/50 overflow-hidden transition-colors duration-300">
        {/* Sharp corner accents */}
        <div className="absolute top-0 left-0 w-1 h-1 border-t-2 border-l-2 border-primary/60" />
        <div className="absolute top-0 right-0 w-1 h-1 border-t-2 border-r-2 border-primary/60" />
        <div className="absolute bottom-0 left-0 w-1 h-1 border-b-2 border-l-2 border-primary/60" />
        <div className="absolute bottom-0 right-0 w-1 h-1 border-b-2 border-r-2 border-primary/60" />

        {/* Moon */}
        <MoonStar
          size={18}
          strokeWidth={0}
          fill="currentColor"
          className={cn(
            "absolute text-foreground transition-all duration-300",
            isDark ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          )}
        />

        {/* Sun */}
        <Sun
          size={36}
          strokeWidth={0}
          fill="currentColor"
          className={cn(
            "absolute text-primary transition-all duration-300",
            !isDark ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          )}
        />
      </div>
    </button>
  )
}
