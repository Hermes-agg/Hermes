"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { AppHeader } from "./app-header"
import { YieldTabs, type TabId } from "@/components/app/YieldTabs"



import { useLoading } from "./loading-context"
import { cn } from "@/lib/utils"
import { MarketSidebar } from "./market-sidebar"
import { CursorSpotlight } from "./decor/cursor-spotlight"
import { AppFooter } from "./app-footer"

export default function YieldLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isLoading, setIsLoading } = useLoading()

  const [activeTab, setActiveTab] = useState<TabId>("top-yields")
  const headerRef = useRef<HTMLElement | null>(null)

  /* Loading states */
  useEffect(() => {
    setIsLoading(true)
    const t = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(t)
  }, [pathname, setIsLoading])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <CursorSpotlight>
        <AppHeader isLoading={false} />

        {/* Page body */}
        <div className="relative z-10">
          <div className="mx-auto h-[calc(100vh-128px)]">
            <div className="flex lg:flex-row items-start w-full h-full">
              {/* Main content */}
              <main
                className={cn(
                  "w-full flex-1 transition-opacity duration-300 w-full h-full",
                  isLoading ? "opacity-50" : "opacity-100"
                )}
              >

                {children}

              </main>




              {/* Sidebar */}
              {/* <div className="w-full max-xl:w-fit lg:w-80 h-full">
                <MarketSidebar />
              </div> */}
            </div>
          </div>
        </div>

        <AppFooter />
      </CursorSpotlight>
    </div >
  )
}
