"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAppLogo } from "@/hooks/use-app-logo"

export function WaitlistHeader() {
  const logoSrc = useAppLogo()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-200",
        isScrolled && "bg-background/90 backdrop-blur-md border-b border-border/50 shadow-sm"
      )}
    >
      <div className="mx-auto flex h-12 md:h-14 items-center justify-between px-4 max-w-6xl min-w-0">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
          <Link href="/" className="flex items-center shrink-0 min-w-0">
            <Image src={logoSrc} alt="Hermes" width={90} height={36} className="h-7 sm:h-8 md:h-9 w-auto object-contain" priority />
          </Link>
          <a href="#waitlist" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Waitlist
          </a>
        </div>
        {mounted && <ThemeToggle />}
      </div>
    </header>
  )
}
