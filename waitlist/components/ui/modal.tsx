"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type ModalProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal(props: ModalProps) {
  const { open, onOpenChange, title, children, className } = props

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div role="dialog" aria-modal className={cn("relative z-10 w-full max-w-md rounded-xl border border-border/50 bg-card p-6 shadow-2xl", className)}>
        {title ? (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={() => onOpenChange(false)} className="rounded p-1 text-muted-foreground hover:bg-secondary" aria-label="Close">
              <X className="size-5" />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  )
}
