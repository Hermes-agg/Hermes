"use client";

import { MarketAnalytics } from "@/components/app/MarketAnalytics";
import { MarketStats } from "@/components/app/MarketStats";
import { YieldPanel } from "@/components/app/yield-panel";


export default function Home() {



  return (
    <div className="mx-auto max-w-7xl transition-opacity duration-300 flex flex-col items-center justify-start w-full flex-1 min-sm:px-1!  md:px-8 lg:mt-6 h-full mt-0! gap-8 3xl:px-20 md:pt-[10vh]">
      <YieldPanel />
      <MarketAnalytics />
      {/* <MarketStats /> */}



    </div>
  );
}
