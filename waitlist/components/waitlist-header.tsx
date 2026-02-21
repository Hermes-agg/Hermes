"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAppLogo } from "@/hooks/use-app-logo"

export function WaitlistHeader() {
  const logoSrc = useAppLogo()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [mobileMenuOpen])

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-200",
          isScrolled && "bg-background/80 backdrop-blur-md border-b border-border/50"
        )}
      >
        <div className="mx-auto flex h-12 md:h-14 items-center justify-between px-4 max-w-6xl">
          <div className="flex items-center gap-6">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 -m-2" aria-label="Menu">
              <div className="flex flex-col gap-1.5">
                <span className={cn("block w-4 h-0.5 bg-foreground transition-all", mobileMenuOpen && "rotate-45 translate-y-1")} />
                <span className={cn("block w-4 h-0.5 bg-foreground transition-all", mobileMenuOpen && "opacity-0")} />
                <span className={cn("block w-4 h-0.5 bg-foreground transition-all", mobileMenuOpen && "-rotate-45 -translate-y-2")} />
              </div>
            </button>
            <Link href="/" className="flex items-center">
              <Image src={logoSrc} alt="Hermes" width={90} height={36} className="h-8 md:h-9 w-auto object-contain" priority />
            </Link>
            <a href="#waitlist" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Waitlist
            </a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="https://x.com/Hermes_agg"
              target="_blank"
              rel="noopener noreferrer"
              className="size-9 flex items-center justify-center rounded-md border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              aria-label="Follow on X"
            >
              <svg fill="currentColor" height="18" viewBox="0 0 20 20" width="18">
                <path d="M15.27 1.59h2.81L11.94 8.6 19.17 18.16h-5.66l-4.07-5.79L1.2 18.16H6.63l3.04-6.88L.83 1.59h6.44l3.77 5.28L15.27 1.59zM14.29 16.48h1.56L5.79 3.18H4.12l10.17 13.3z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <div
        onClick={() => setMobileMenuOpen(false)}
        className={cn("fixed inset-0 z-40 bg-black/40 md:hidden", mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none")}
      />

      <div className={cn("fixed inset-y-0 right-0 z-50 w-64 bg-card border-l md:hidden transform transition-transform", mobileMenuOpen ? "translate-x-0" : "translate-x-full")}>
        <div className="p-6 space-y-4">
          <a href="#waitlist" onClick={() => setMobileMenuOpen(false)} className="block text-foreground font-medium">
            Waitlist
          </a>
          <ThemeToggle />
          <a href="https://x.com/Hermes_agg" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <svg fill="currentColor" height="18" viewBox="0 0 20 20" width="18"><path d="M15.27 1.59h2.81L11.94 8.6 19.17 18.16h-5.66l-4.07-5.79L1.2 18.16H6.63l3.04-6.88L.83 1.59h6.44l3.77 5.28L15.27 1.59z" /></svg>
            @Hermes_agg
          </a>
        </div>
      </div>
    </>
  )
}
