import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  isLoading?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot="button"
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 rounded-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] touch-manipulation",
        variant === "default" && "bg-primary text-primary-foreground border border-border hover:border-primary/90",
        variant === "outline" && "border bg-background shadow-xs hover:bg-input/5 dark:bg-input/30 dark:border-input text-foreground",
        variant === "ghost" && "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        size === "default" && "h-9 px-4 py-2",
        size === "sm" && "h-8 gap-1.5 px-3",
        size === "lg" && "h-11 px-6",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  )
}

export { Button }
