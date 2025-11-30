"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  const navItems = [
    { label: "Yield", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Analytics", href: "/analytics" },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6 lg:gap-10">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              {/* <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-lg">Ⓗ</span>
              </div> */}
              <span className="text-xl font-bold tracking-tight text-foreground">Hermes</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "relative rounded-lg px-4 py-2 text-sm font-medium transition-all",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute inset-x-2 -bottom-[17px] h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Network selector */}
            <button className="hidden items-center gap-2 rounded-xl border border-border/50 bg-secondary/50 px-3 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/30 hover:bg-secondary sm:flex">
              <div className="h-4 w-4 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195]" />
              <span className="hidden lg:inline">Solana</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Connect wallet button */}
            <Button
              size="sm"
              className="gap-2 bg-primary text-xs font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 glow-primary sm:text-sm">
              Connect
            </Button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu*/}
      <div
        className={cn(
          "fixed inset-0 z-99 bg-background/80 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={cn(
          "fixed right-0 top-0 z-99 h-full w-72 border-l border-border/50 bg-background shadow-2xl transition-transform duration-300 ease-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          <span className="text-lg font-bold text-foreground">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 text-foreground transition-colors hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Network selector in mobile menu */}
        <div className="border-t border-border/50 p-4">
          <button className="flex w-full items-center gap-2 rounded-xl border border-border/50 bg-secondary/50 px-4 py-3 text-sm font-medium text-foreground transition-all hover:border-primary/30">
            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195]" />
            <span>Solana</span>
            <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </>
  )
}
