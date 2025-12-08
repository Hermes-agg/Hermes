import { useState, useEffect } from "react"
import { X, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { CustomConnectButton } from "../connect/CustomConnectButton"
import { SettingsModal } from "../settings-modal"

import useAppLogo from "@/asssets/image";
import Image from "next/image"
import { usePathname } from "next/navigation"
import Link from "next/link"

interface AppHeaderProps {
  isLoading?: boolean
}

export function AppHeader({ isLoading = false }: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const pathname = usePathname()

  const app_logo = useAppLogo()


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
      <header className="sticky top-0 z-50 bg-background border-b border-border/30">
        <div className="mx-auto flex h-12 md:h-14 max-w-6xl items-center justify-between px-4">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-1 md:gap-8">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center text-foreground transition-all md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" strokeWidth={2.5} />
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="w-4 h-[1.5px] bg-foreground" />
                  <span className="w-2 h-[1.5px] bg-foreground" />
                  <span className="w-3 h-[1.5px] bg-foreground" />
                </div>
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              {/* <div className="w-1 h-5 bg-primary" /> */}

              <Image
                src={app_logo}
                alt="App Logo"

                width={96}
                height={40}
                className="object-contain h-8 md:h-10 w-auto"
                priority

              />
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
                      "relative px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider transition-all group rounded-sm",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >

                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2">
            {/* Settings Button */}
            <button
              onClick={() => setSettingsOpen(true)}
              className={cn(
                "flex items-center justify-center w-9 h-9  border-border/50 bg-background/50",
                "transition-all hover:border-primary/50 hover:text-primary relative group"
              )}
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <CustomConnectButton />
          </div>
        </div>

        {/* Loading Bar */}
        <div className="relative h-[2px] w-full overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 bg-border/20">
              <div className="absolute h-full w-8 animate-pulse bg-gradient-to-r from-transparent via-primary to-transparent"
                style={{ animation: "scan 2s infinite linear" }} />
            </div>
          ) : (
            <></>
          )}
        </div>
      </header>

      {/* BACKDROP OVERLAY */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          "fixed inset-0 z-80 bg-background/80 backdrop-blur-sm transition-all duration-300 md:hidden",
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      />

      {/* MOBILE MENU - Slides from LEFT */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-99 w-72 bg-card border-r border-border/50 shadow-2xl",
          "transform transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border/50 px-4">
          <span className="font-mono text-sm font-bold uppercase tracking-wider">Menu</span>

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
                  "relative px-4 py-3 font-mono text-sm font-medium uppercase tracking-wider transition-all rounded-sm",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {active && (
                  <>

                  </>
                )}
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}
