"use client";

import { useState, useRef, useEffect } from "react";
import { YieldTabs, type TabId } from "@/components/app/YieldTabs";
import { YieldPanel } from "@/components/app/yield-panel";

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
  const [headerHeight, setHeaderHeight] = useState(56); // default fallback
  const contentRef = useRef<HTMLDivElement | null>(null);

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
  });

  // Get header height on client
  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      setHeaderHeight(header.getBoundingClientRect().height);
    }
  }, []);

  const handleTabChange = (tab: TabId) => {
    // Save current scroll position for current tab
    scrollPositions.current[activeTab] = window.scrollY;

    setActiveTab(tab);

    // Delay to ensure content renders before scrolling
    setTimeout(() => {
      if (!contentRef.current) return;

      const previousPosition = scrollPositions.current[tab];

      if (previousPosition > 0) {
        // Restore last scroll position for this tab
        window.scrollTo({ top: previousPosition, behavior: "auto" });
      } else {
        // Scroll to top of content section (below header)
        const top = contentRef.current.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 50);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "top-yields":
        return <TopYieldsContent />;
      case "trending":
        return <TrendingContent />;
      case "protocols":
        return <ProtocolsContent />;
      case "hot-tokens":
        return <HotTokensContent />;
      case "low-risk":
        return <RiskFilteredContent riskLevel="low" />;
      case "high-risk":
        return <RiskFilteredContent riskLevel="high" />;
      case "new-programs":
        return <NewProgramsContent />;
      case "stablecoins":
        return <StablecoinsContent />;
      case "solana-ecosystem":
        return <SolanaEcosystemContent />;
      default:
        return <TopYieldsContent />;
    }
  };

  return (
    <>

      <YieldPanel />


    </>
  );
}
