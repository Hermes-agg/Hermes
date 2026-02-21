"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        "flex items-center rounded-md border border-border/50 bg-secondary/30 p-1 gap-0.5",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={!isDark}
        className={cn(
          "p-1.5 rounded transition-colors",
          !isDark ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Sun className="size-4" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={isDark}
        className={cn(
          "p-1.5 rounded transition-colors",
          isDark ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Moon className="size-4" strokeWidth={2} />
      </button>
    </div>
  )
}
