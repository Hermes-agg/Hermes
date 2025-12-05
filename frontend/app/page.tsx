"use client"

import { YieldPanel } from "@/components/app/yield-panel"
import { useState, useRef } from "react";
import { YieldTabs, type TabId } from "@/components/app/YieldTabs";

import { TopYieldsContent } from "@/components/app/tab-content/TopYieldsContent";
import { TrendingContent } from "@/components/app/tab-content/TrendingContent";
import { ProtocolsContent } from "@/components/app/tab-content/ProtocolsContent";
import { HotTokensContent } from "@/components/app/tab-content/HotTokensContent";
import { RiskFilteredContent } from "@/components/app/tab-content/RiskFilteredContent";
import { NewProgramsContent } from "@/components/app/tab-content/NewProgramsContent";
import { StablecoinsContent } from "@/components/app/tab-content/StablecoinsContent";
import { SolanaEcosystemContent } from "@/components/app/tab-content/SolanaEcosystemContent";

export default function Home() {

  const [activeTab, setActiveTab] = useState<TabId>("top-yields");

  // Store scroll positions for each tab
  const scrollPositions = useRef<Record<TabId, number>>({
    "top-yields": 0,
    "trending": 0,
    "protocols": 0,
    "hot-tokens": 0,
    "low-risk": 0,
    "high-risk": 0,
    "new-programs": 0,
    "stablecoins": 0,
    "solana-ecosystem": 0
  });

  // ref to tab content section
  const contentRef = useRef<HTMLDivElement | null>(null);

  const handleTabChange = (tab: TabId) => {
    // Save the scroll position of the tab being left
    scrollPositions.current[activeTab] = window.scrollY;

    setActiveTab(tab);

    setTimeout(() => {
      if (!contentRef.current) return;

      const previousPosition = scrollPositions.current[tab];

      if (previousPosition > 0) {
        // Restore scroll position inside the content block
        window.scrollTo({ top: previousPosition, behavior: "instant" });
      } else {
        // Always scroll down to tab content (skipping Yield Panel)
        const scrollTarget =
          contentRef.current.getBoundingClientRect().top + window.scrollY - 90;

        window.scrollTo({ top: scrollTarget, behavior: "smooth" });
      }
    }, 30);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "top-yields": return <TopYieldsContent />;
      case "trending": return <TrendingContent />;
      case "protocols": return <ProtocolsContent />;
      case "hot-tokens": return <HotTokensContent />;
      case "low-risk": return <RiskFilteredContent riskLevel="low" />;
      case "high-risk": return <RiskFilteredContent riskLevel="high" />;
      case "new-programs": return <NewProgramsContent />;
      case "stablecoins": return <StablecoinsContent />;
      case "solana-ecosystem": return <SolanaEcosystemContent />;
      default: return <TopYieldsContent />;
    }
  };

  const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 56;

  return (
    <>
      <YieldTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-6 md:py-10">
        <div className="mb-8">
          <YieldPanel />
        </div>

        {/* main content always scrolled into view */}
        <div
          id="tab-content"
          className={`max-w-2xl mx-auto`}
          style={{
            paddingTop: `${headerHeight - 38}px`,
            marginTop: `-${headerHeight - 38}px`,
          }}
          ref={contentRef}
        >
          {renderTabContent()}
        </div>

      </main>
    </>
  );
}
