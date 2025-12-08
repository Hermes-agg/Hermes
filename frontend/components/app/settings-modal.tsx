import { useState } from "react"
import { X, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/50 bg-card p-0 gap-0 max-w-sm">
        {/* Sharp corner accents */}
        {/* <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary" /> */}

        <DialogHeader className="border-b border-border/50 p-4">
          <DialogTitle className="font-mono text-sm uppercase tracking-wider text-foreground">
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Theme Setting */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-foreground mb-0.5">
                Theme
              </div>
              <div className="text-xs text-muted-foreground">
                Switch between light and dark mode
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={cn(
                "relative flex items-center justify-center w-16 h-8 border border-border/50 bg-background/50 rounded-lg",
                "transition-all hover:border-primary/50"
              )}
            >
              {/* Sharp corner accents */}
              {/* <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-primary/50" />
              <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-primary/50" />
              <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-primary/50" />
              <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-primary/50" /> */}

              <div className="flex items-center gap-2">
                <Moon
                  size={16}
                  className={cn(
                    "transition-all",
                    theme === "dark" ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <Sun
                  size={16}
                  className={cn(
                    "transition-all",
                    theme === "light" ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </div>
            </button>
          </div>

          {/* Placeholder for future settings */}
          <div className="border-t border-border/30 pt-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              More settings coming soon
            </div>
            <div className="text-xs text-muted-foreground/60">
              Notifications, language, and other preferences will be available here.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
