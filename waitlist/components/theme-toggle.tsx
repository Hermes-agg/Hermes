"use client";

import { useTheme } from "next-themes";
import { MoonStar, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      className={cn(
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm overflow-hidden",
        className
      )}
    >
      <div className="relative flex items-center justify-center w-12 h-7 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300">
        <MoonStar
          size={16}
          strokeWidth={0}
          fill="currentColor"
          className={cn(
            "absolute text-foreground transition-all duration-300",
            isDark ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          )}
        />
        <Sun
          size={16}
          strokeWidth={0}
          fill="currentColor"
          className={cn(
            "absolute text-primary transition-all duration-300",
            !isDark ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          )}
        />
      </div>
    </button>
  );
}
