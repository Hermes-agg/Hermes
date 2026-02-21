"use client"

import { ChevronDown } from "lucide-react"

export function ScrollArrow() {
  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
  }

  return (
    <button
      onClick={scrollDown}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 size-11 sm:size-12 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 shadow-lg touch-manipulation hover:scale-105 active:scale-95"
      aria-label="Scroll down"
    >
      <ChevronDown className="size-6" />
    </button>
  )
}
