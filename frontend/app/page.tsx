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
import { MarketStats } from "@/components/app/MarketStats";

export default function Home() {



  return (
    <div className="flex flex-col space-y-3">
      <MarketStats />

      <YieldPanel />


    </div>
  );
}
