"use client";

import { MarketAnalytics } from "@/components/app/MarketAnalytics";
import { MarketStats } from "@/components/app/MarketStats";
import { YieldPanel } from "@/components/app/yield-panel";


export default function Home() {



  return (
    <div className=" mx-auto max-w-7xl transition-opacity duration-300 flex flex-col items-center justify-start w-full flex-1 h-full mt-0! gap-8 ">
      {/* <MarketStats /> */}

      <YieldPanel />


      <MarketAnalytics />



    </div>
  );
}
