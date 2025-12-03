"use client"

import { useMemo } from "react"
import { ArrowRight, CheckCircle2, TrendingUp, ShieldCheck, Users, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Token } from "@/components/app/token-selector"

interface YieldRoutesProps {
  token: Token
  amount: number
}

const allRoutes = [
  {
    id: 1,
    protocol: "Kamino",
    strategy: "Lending",
    baseApy: 8.5,
    tvl: "$245M",
    steps: ["Deposit", "Auto-compound"],
    users: "12.5k",
    tokens: ["SOL", "USDC", "USDT"],
  },
  {
    id: 2,
    protocol: "Marinade",
    strategy: "Liquid Staking",
    baseApy: 7.2,
    tvl: "$580M",
    steps: ["Stake SOL", "Receive mSOL"],
    users: "45.2k",
    tokens: ["SOL"],
  },
  {
    id: 3,
    protocol: "Solend",
    strategy: "Lending Pool",
    baseApy: 9.8,
    tvl: "$156M",
    steps: ["Deposit", "Earn interest"],
    users: "8.3k",
    tokens: ["SOL", "USDC", "USDT", "mSOL"],
  },
  {
    id: 4,
    protocol: "Kamino + Solend",
    strategy: "Leverage Loop",
    baseApy: 15.5,
    tvl: "$89M",
    steps: ["Deposit", "Borrow", "Re-deposit", "Loop"],
    users: "5.2k",
    tokens: ["SOL", "USDC", "USDT"],
  },
  {
    id: 5,
    protocol: "Drift",
    strategy: "Delta Neutral LP",
    baseApy: 18.2,
    tvl: "$124M",
    steps: ["Deposit", "Provide liquidity", "Hedge"],
    users: "3.8k",
    tokens: ["SOL", "USDC"],
  },
  {
    id: 6,
    protocol: "Jito",
    strategy: "MEV Staking",
    baseApy: 8.9,
    tvl: "$1.2B",
    steps: ["Stake SOL", "Receive JitoSOL"],
    users: "89.2k",
    tokens: ["SOL", "JitoSOL"],
  },
  {
    id: 7,
    protocol: "Drift",
    strategy: "Perpetual LP",
    baseApy: 22.5,
    tvl: "$45M",
    steps: ["Deposit", "Provide perp liquidity"],
    users: "1.8k",
    tokens: ["SOL", "USDC"],
  },
  {
    id: 8,
    protocol: "Meteora",
    strategy: "DLMM Pool",
    baseApy: 28.2,
    tvl: "$132M",
    steps: ["Deposit pair", "Provide concentrated LP"],
    users: "12.4k",
    tokens: ["SOL", "USDC", "USDT"],
  },
  {
    id: 9,
    protocol: "Raydium",
    strategy: "Concentrated LP",
    baseApy: 32.5,
    tvl: "$278M",
    steps: ["Add liquidity", "Set range", "Earn fees"],
    users: "24.1k",
    tokens: ["SOL", "USDC", "USDT", "mSOL"],
  },
]

export function YieldRoutes({ token, amount }: YieldRoutesProps) {
  const filteredRoutes = useMemo(() => {
    return allRoutes
      .filter((route) => route.tokens.includes(token.symbol))
      .map((route) => ({
        ...route,
        projectedYearly: (amount * route.baseApy) / 100,
        projectedMonthly: (amount * route.baseApy) / 100 / 12,
        // Larger deposits = slightly lower effective APY due to slippage
        effectiveApy: route.baseApy * (amount > 10000 ? 0.95 : amount > 1000 ? 0.98 : 1),
      }))
      .sort((a, b) => b.effectiveApy - a.effectiveApy)
      .slice(0, 5)
  }, [token, amount])

  if (filteredRoutes.length === 0) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/80 p-8 text-center backdrop-blur-sm">
        <p className="text-muted-foreground">No routes found for {token.symbol}.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl backdrop-blur-sm">
      <div className="py-3 sm:py-4">
        <div className="flex gap-1 flex-row sm:items-center justify-between">
          <div className="min-w-0">
            <h2 className="truncate text-base sm:text-lg font-semibold text-foreground text-heroic">Best Routes</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Sorted by highest yield</p>
          </div>

          <div className="min-w-0 flex flex-col items-end justify-end">
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              {filteredRoutes.length} routes for {amount} {token.symbol}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filteredRoutes.map((route, index) => (
          <div
            key={route.id}
            className={cn("transition-all hover:bg-secondary/30 flex flex-col gap-4 p-3 sm:p-4 border-2 border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all group relative overflow-hidden", index === 0 && "bg-primary/5")}
          >
            <div >
              {/* Route card example - blocky style */}
              <div className="">
                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-2 h-2 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Mobile layout */}
                <div className="flex flex-col gap-3 sm:hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="text-xs font-bold text-foreground h-8 w-8 sm:h-7 sm:w-7 bg-primary/20 border border-primary/30 flex items-center justify-center">
                        {route.protocol.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="truncate font-semibold text-sm text-foreground">{route.protocol}</span>
                          {index === 0 && (
                            <span className="flex items-center gap-0.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs font-medium text-primary flex-shrink-0">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              <span className="inline">Best</span>
                            </span>
                          )}

                          <span className="flex items-center gap-1 flex-shrink-0">
                            <ShieldCheck className="h-3 w-3 text-primary" />
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{route.strategy}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-lg sm:text-xl font-bold text-primary">
                        {route.effectiveApy.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">APY</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 rounded-xl text-xs sm:text-sm">
                    <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <ShieldCheck className="h-3 w-3" />
                        TVL: {route.tvl}
                      </span>
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Users className="h-3 w-3" />
                        {route.users} users
                      </span>
                    </div>


                    <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground flex-wrap">
                      <div>
                        <span className="text-muted-foreground">Monthly: </span>
                        <span className="font-medium text-foreground">${route.projectedMonthly.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Yearly: </span>
                        <span className="font-medium text-primary">${route.projectedYearly.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className={cn("flex-shrink-0", index === 0 && "bg-primary text-primary-foreground glow-primary")}
                      variant={index === 0 ? "default" : "outline"}
                    >
                      Deposit
                      <ExternalLink className="ml-1 h-2 w-2" />
                    </Button>

                  </div>
                  {/* 
             

              {/* <div className="flex flex-wrap items-center gap-1 text-xs overflow-x-auto">
                {route.steps.map((step, i) => (
                  <span key={i} className="flex items-center gap-1 flex-shrink-0">
                    <span className="rounded-md bg-secondary px-1.5 py-0.5 text-muted-foreground whitespace-nowrap">
                      {step}
                    </span>
                    {i < route.steps.length - 1 && (
                      <ArrowRight className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0" />
                    )}
                  </span>
                ))}
              </div> */}
                </div>

                {/* Desktop layout */}
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2 sm:gap-4">

                    <div className="flex flex-col gap-2 w-full">
                      <div className="min-w-0 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 font-bold text-foreground sm:h-7 sm:w-7 bg-primary/20 border border-primary/30 items-center justify-center">
                            {route.protocol.charAt(0)}
                          </div>

                          <span className="truncate font-semibold text-foreground">{route.protocol}</span>
                          {index === 0 && (
                            <span className="flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary flex-shrink-0">
                              <CheckCircle2 className="h-3 w-3" />
                              Best
                            </span>
                          )}
                          <span className="flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary flex-shrink-0">
                            <ShieldCheck className="h-3 w-3" />
                            Verified
                          </span>


                          <div className="mt-1 text-sm text-muted-foreground">{route.strategy}</div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                            <TrendingUp className="h-5 w-5" />
                            {route.effectiveApy.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">APY</div>
                        </div>
                      </div>

                      <div className="w-full flex items-center justify-between gap-4 sm:gap-6 lg:gap-8 flex-shrink-0">
                        <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1 flex-shrink-0">
                            <ShieldCheck className="h-3 w-3" />
                            TVL: {route.tvl}
                          </span>
                          <span className="flex items-center gap-1 flex-shrink-0">
                            <Users className="h-3 w-3" />
                            {route.users} users
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-4 sm:gap-6 lg:gap-8 flex-shrink-0" >
                          <div className="hidden text-right lg:block">
                            <div className="text-sm text-muted-foreground">Est. Monthly</div>
                            <div className="font-semibold text-foreground">${route.projectedMonthly.toFixed(2)}</div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Est. Yearly</div>
                            <div className="font-semibold text-primary">${route.projectedYearly.toFixed(2)}</div>
                          </div>

                          <Button
                            className={cn("flex-shrink-0", index === 0 && "bg-primary text-primary-foreground glow-primary")}
                            variant={index === 0 ? "default" : "outline"}
                          >
                            Deposit
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1.5 text-xs flex-wrap">
                  {route.steps.map((step, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="rounded-md bg-secondary px-2 py-1 text-muted-foreground">{step}</span>
                      {i < route.steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1 flex-shrink-0">
                    <ShieldCheck className="h-3 w-3" />
                    TVL: {route.tvl}
                  </span>
                  <span className="flex items-center gap-1 flex-shrink-0">
                    <Users className="h-3 w-3" />
                    {route.users} users
                  </span>
                </div>
              </div> */}
                </div>
              </div> </div> </div>
        ))}
      </div>
    </div>
  )
}
