"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { ThemeModeToggle } from "../ThemeModeToggle"
import { CustomConnectButton } from "@/components/app/connect/CustomConnectButton"
import { ConnectWalletButton } from "@/components/app/connect/ConnectWalletButton"

interface AppHeaderProps {
  isLoading?: boolean
}

export function AppHeader({ isLoading = false }: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
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
      {/* MAIN HEADER */}
      <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b">
        <div className="mx-auto flex h-11 max-w-6xl items-center justify-between px-4">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-2 md:gap-6 lg:gap-10">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center text-foreground transition-all md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" strokeWidth={3} />
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="w-5 h-[2px] bg-foreground" />
                  <span className="w-4 h-[2px] bg-foreground" />
                  <span className="w-3 h-[2px] bg-foreground" />
                </div>
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold tracking-tight text-foreground">
                Hermes
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "relative rounded-lg px-4 py-2 text-sm font-medium transition-all group",
                      active
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {/* Hover corners */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.label}
                    {active && (
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <ThemeModeToggle />
            </div>
            <CustomConnectButton />
          </div>
        </div>

        {/* Loading Bar */}
        <div className="relative h-[2px] w-full overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 bg-border/20">
              <div className="absolute inset-0">
                <div className="absolute h-full w-1 animate-[scan_3s_infinite] bg-gradient-to-r from-transparent via-primary to-transparent blur-sm" />
              </div>
            </div>
          ) : (
            <div className="h-[2px] bg-border/20" />
          )}
        </div>
      </header>

      {/* BACKDROP OVERLAY */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          "fixed inset-0 z-80 bg-black/50 backdrop-blur-sm transition-all duration-300 md:hidden",
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      />

      {/* MOBILE MENU - Slides from LEFT */}
      <div
        className={cn(
          "fixed inset-y-0 z-99 w-72 bg-background border-r border-border/50 shadow-2xl",
          "transform transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-6">

          <div className="border-b border-border/50 bg-background/80 backdrop-blur-md w-full flex items-center ">
            <span className="text-lg font-bold">Menu</span>

          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" strokeWidth={3} />
          </button>
        </div>



        {/* Navigation Links */}
        <nav className="flex flex-col p-4 gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "relative px-4 py-3 text-sm font-medium transition-all",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {active && (
                  <>
                    {/* Sharp corner accents */}
                    <div className="absolute top-0 left-0 w-1 h-1 border-t-2 border-l-2 border-primary" />
                    <div className="absolute top-0 right-0 w-1 h-1 border-t-2 border-r-2 border-primary" />
                    <div className="absolute bottom-0 left-0 w-1 h-1 border-b-2 border-l-2 border-primary" />
                    <div className="absolute bottom-0 right-0 w-1 h-1 border-b-2 border-r-2 border-primary" />
                  </>
                )}

                {item.label}
              </Link>
            )
          })}


          <div className="border-b border-border/50 bg-background/80 backdrop-blur-md w-full flex items-center ">
            <span className="text-lg font-bold">Menu</span>
            <div className="p-4 space-y-4">
              <ThemeModeToggle />
              {/* <ConnectWalletButton /> */}
            </div>
          </div>
        </nav>


        {/* Bottom Actions */}
        <div className="absolute inset-x-0 bottom-0 border-t border-border/50 bg-background/80 backdrop-blur-md">
          <div className="p-4 space-y-4">
            <ThemeModeToggle />
            {/* <ConnectWalletButton /> */}
          </div>
        </div>
      </div>
    </>
  )
}