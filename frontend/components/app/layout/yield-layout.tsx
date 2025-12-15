"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

import { AppHeader } from "./app-header"
import { AppFooter } from "./app-footer"
import { CursorSpotlight } from "./decor/cursor-spotlight"

import { useLoading } from "./loading-context"
import { cn } from "@/lib/utils"

export default function YieldLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
        {/* FLEX COLUMN IS THE KEY */}
        <div className="min-h-screen flex flex-col relative">

          <AppHeader isLoading={isLoading} />

          {/* MAIN CONTENT */}
          <main
            className={cn(
              "flex-1 md:mx-auto max-w-7xl py-6 md:py-10 transition-opacity duration-300",
              isLoading ? "opacity-50" : "opacity-100"
            )}
          >
            {children}
          </main>

          {/* FOOTER — ALWAYS AT BOTTOM */}
          <AppFooter />
        </div>
      </CursorSpotlight>
    </div>
  )
}
