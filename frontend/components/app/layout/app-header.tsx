"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X, ChevronDown } from "lucide-react"
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeModeToggle } from "../ThemeModeToggle"
import { ConnectWalletButton } from '@/components/app/connect/ConnectWalletButton'
import { CustomConnectButton } from '@/components/app/connect/CustomConnectButton'

interface AppHeaderProps {
  isLoading?: boolean
}

export function AppHeader({ isLoading = false }: AppHeaderProps) {
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

  // Theme-aware logo: use resolvedTheme and a mounted guard to avoid hydration mismatch
  const { resolvedTheme } = useTheme()
  const [mountedLogo, setMountedLogo] = useState(false)
  useEffect(() => {
    setMountedLogo(true)
  }, [])

  const navItems = [
    { label: "Yield", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Analytics", href: "/analytics" },
  ]

  // Wallet modal button will handle connection via wallet-adapter

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 md:gap-6 lg:gap-10">
            {/* Mobile menu button - Thick Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-secondary md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" strokeWidth={3} />
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              )}
            </button>
            
            

            

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "relative rounded-lg px-4 py-2 text-sm font-medium transition-all group",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                    {item.label}

                    {isActive && (
                      <>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary" />
                      </>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={mountedLogo && resolvedTheme === 'dark' ? '/hermes-dark-logo.png' : '/hermes-logo.png'}
                alt="Hermes"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-xl font-bold tracking-tight text-foreground hidden md:inline">Hermes</span>
            </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">


            {/* Network selector */}
            <button className="hidden items-center gap-2 border border-border/50 bg-secondary/50 px-3 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/30 hover:bg-secondary md:flex">
              <div className="h-4 w-4 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195]" />
              <span className="hidden md:inline">Solana</span>
            </button>

            {/* wallet (modal-based) - custom UI */}
            <CustomConnectButton />




          </div>
        </div>

        {/* Animated Border Effect - Only shows when loading */}
        <div className="relative h-[2px] w-full overflow-hidden">
          {/* Left static border */}
          <div
            className={cn(
              "hidden absolute left-0 top-0 h-full w-[15%] bg-gradient-to-r from-primary/80 to-primary/20 transition-opacity duration-300",
              isLoading ? "opacity-100" : "opacity-100",
            )}
          />

          {/* Right static border */}
          <div
            className={cn(
              "hidden absolute right-0 top-0 h-full w-[15%] bg-gradient-to-l from-primary/80 to-primary/20 transition-opacity duration-300",
              isLoading ? "opacity-100" : "opacity-100",
            )}
          />

          {/* Middle animated connection area - only animates when loading */}
          {isLoading && (
            <div className="absolute left-[15%] right-[15%] top-0 h-full">
              {/* Background dim line */}
              <div className="absolute inset-0 bg-border/30" />

              {/* Animated scanning line */}
              <div className="absolute inset-0">
                <div className="absolute h-full w-1 animate-[scan_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary to-transparent blur-sm" />
              </div>

              {/* Data packets traveling - spawn from nodes and disappear */}
              <div className="absolute inset-0">
                <div className="absolute left-0 top-1/2 h-1 w-3 -translate-y-1/2 animate-[packet-left_2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary to-primary/50 blur-[1px]" />
              </div>
            </div>
          )}

          {/* Static dim line when not loading */}
          {!isLoading && (
            <div className="absolute left-[15%] right-[15%] top-0 h-full">
              <div className="absolute inset-0 bg-border/20" />
            </div>
          )}
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
            className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-secondary"
          >
            <X className="h-5 w-5" strokeWidth={3} />
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
                  "px-4 py-3 text-sm font-medium transition-all",
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
          <button className="flex w-full items-center gap-2 border border-border/50 bg-secondary/50 px-4 py-3 text-sm font-medium text-foreground transition-all hover:border-primary/30">
            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195]" />
            <span>Solana</span>
          </button>
        </div>
        <div className="p-4 border-t border-border/50">
          <ConnectWalletButton />
        </div>
      </div>
    </>
  )
}
