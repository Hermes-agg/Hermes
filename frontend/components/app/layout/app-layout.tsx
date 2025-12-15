"use client"

import type React from "react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

import { AppHeader } from "./app-header"
import { AppFooter } from "./app-footer"
import { CursorSpotlight } from "./decor/cursor-spotlight"

import { LoadingProvider, useLoading } from "./loading-context"
import WalletAdapterProvider from "@/components/app/providers/WalletAdapterProvider"

import { cn } from "@/lib/utils"
import YieldLayout from "./yield-layout"

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isLoading, setIsLoading } = useLoading()

  useEffect(() => {
    setIsLoading(true)
    const t = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(t)
  }, [pathname, setIsLoading])

  return (
    <div className="min-h-screen bg-background">
      <CursorSpotlight>
        <div className="min-h-screen flex flex-col relative">
          <AppHeader isLoading={isLoading} />

          <main
            className={cn(
              "flex-1 mx-3 md:mx-auto max-w-7xl py-6 md:py-10 transition-opacity duration-300",
              isLoading ? "opacity-50" : "opacity-100"
            )}
          >
            {children}
          </main>

          <AppFooter />
        </div>
      </CursorSpotlight>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isYieldPage = pathname === "/" || pathname.startsWith("/yields")
  const Layout = isYieldPage ? YieldLayout : AppLayoutContent

  return (
    <WalletAdapterProvider>
      <LoadingProvider>
        <Layout>{children}</Layout>
      </LoadingProvider>
    </WalletAdapterProvider>
  )
}
