"use client";

import { MarketAnalytics } from "@/components/app/MarketAnalytics";
import { YieldPanel } from "@/components/app/yield-panel";
import Image from "next/image";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl transition-opacity duration-300 flex flex-col items-center justify-start w-full flex-1 min-sm:px-1 md:px-8 h-full mt-0 gap-6 3xl:px-20 pt-[10vh] md:pt-[15vh]">

      {/* Banner / Ad Section */}
      <div className="w-full mx-auto max-w-2xl">
        <HermesBanner />
      </div>

      {/* Yield Panel */}
      <div className="w-full flex-1 flex flex-col">
        <YieldPanel />
      </div>

      {/* Bottom Analytics */}
      <div className="w-full flex shrink-0 md:pt-6 items-center justify-end mb-6">
        <MarketAnalytics />
      </div>

    </div>
  );
}


function HermesBanner() {
  return (
    <div className="w-full mx-auto max-w-2xl hidden">
      <div
        className="
          card-base
          rounded-md border
          bg-gradient-to-br from-primary/90 to-primary
          p-5 md:p-6
          opacity-0 pointer-events-none
        "
      >
        <div className="flex items-center gap-4">
          {/* Hermes Logo */}
          <div
            className="
              h-11 w-11 rounded-xl
              bg-background/15
              flex items-center justify-center
              shrink-0
            "
          >
            <Image
              src="/brand/hermes.png"
              alt="Hermes logo"
              width={24}
              height={24}
              className="object-contain"
              priority
            />
          </div>

          <div className="flex flex-col">
            <h2 className="text-sm md:text-base font-semibold text-primary-foreground">
              Hermes Yield Explorer
            </h2>

            <p className="text-xs md:text-sm text-primary-foreground/75 leading-snug">
              Aggregated APYs, protocols, and on-chain yield signals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

