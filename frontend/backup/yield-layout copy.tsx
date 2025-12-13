"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { AppHeader } from "../components/app/layout/app-header"
import { YieldTabs, type TabId } from "@/components/app/YieldTabs"

import { TopYieldsContent } from "@/components/app/tab-content/TopYieldsContent"
import { TrendingContent } from "@/components/app/tab-content/TrendingContent"
import { ProtocolsContent } from "@/components/app/tab-content/ProtocolsContent"
import { HotTokensContent } from "@/components/app/tab-content/HotTokensContent"
import { RiskFilteredContent } from "@/components/app/tab-content/RiskFilteredContent"
import { NewProgramsContent } from "@/components/app/tab-content/NewProgramsContent"
import { StablecoinsContent } from "@/components/app/tab-content/StablecoinsContent"
import { SolanaEcosystemContent } from "@/components/app/tab-content/SolanaEcosystemContent"

import { LoadingProvider, useLoading } from "../components/app/layout/loading-context"
import { cn } from "@/lib/utils"
import { MarketStats } from "../components/app/MarketStats"


export default function YieldLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const [activeTab, setActiveTab] = useState<TabId>("top-yields")
  const [headerHeight, setHeaderHeight] = useState(56)

  const contentRef = useRef<HTMLDivElement | null>(null)

  const { isLoading, setIsLoading } = useLoading()


  // Show loading on initial mount
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [setIsLoading])

  // Show loading when route changes
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [pathname, setIsLoading])

  // Store scroll positions per tab
  const scrollPositions = useRef<Record<TabId, number>>({
    "top-yields": 0,
    "trending": 0,
    "protocols": 0,
    "hot-tokens": 0,
    "low-risk": 0,
    "high-risk": 0,
    "new-programs": 0,
    "stablecoins": 0,
    "solana-ecosystem": 0,
  })

  // Get header height
  useEffect(() => {
    const header = document.querySelector("header")
    if (header) {
      setHeaderHeight(header.getBoundingClientRect().height)
    }
  }, [])

  const handleTabChange = (tab: TabId) => {
    // Save scroll position for current tab
    scrollPositions.current[activeTab] = window.scrollY

    setActiveTab(tab)

    // Wait for render before scrolling
    setTimeout(() => {
      if (!contentRef.current) return

      const prevPosition = scrollPositions.current[tab]

      if (prevPosition > 0) {
        window.scrollTo({ top: prevPosition, behavior: "auto" })
      } else {
        const top =
          contentRef.current.getBoundingClientRect().top +
          window.scrollY -
          headerHeight

        window.scrollTo({ top, behavior: "smooth" })
      }
    }, 50)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "top-yields":
        return <TopYieldsContent />
      case "trending":
        return <TrendingContent />
      case "protocols":
        return <ProtocolsContent />
      case "hot-tokens":
        return <HotTokensContent />
      case "low-risk":
        return <RiskFilteredContent riskLevel="low" />
      case "high-risk":
        return <RiskFilteredContent riskLevel="high" />
      case "new-programs":
        return <NewProgramsContent />
      case "stablecoins":
        return <StablecoinsContent />
      case "solana-ecosystem":
        return <SolanaEcosystemContent />
      default:
        return <TopYieldsContent />
    }
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <AppHeader isLoading={false} />

        {/* Tabs */}
        {/* <YieldTabs activeTab={activeTab} onTabChange={handleTabChange} /> */}

        {/* Main Content */}
        <div className="relative z-10">
          <main
            className={cn(
              "pb-6 mx-3 md:mx-auto max-w-7xl transition-opacity duration-300 flex flex-col items-center justify-center h-[calc(100vh-64px)]",
              isLoading ? "opacity-50" : "opacity-100"
            )}
          >{/* <BackgroundDecor /> */}

            {/* <MarketStats /> */}
            {children}


            {/* Tab Content */}
            {/* <div
            id="tab-content"
            ref={contentRef}
            className="max-w-2xl mx-auto"
            style={{ paddingTop: `${headerHeight}px` }}
          >
            {renderTabContent()}
          </div> */}
          </main>
        </div>
      </div>
    </>
  )
}
