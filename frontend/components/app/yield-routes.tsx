"use client";

import { cn } from "@/lib/utils"
import type { Token } from "./TokenSelector"
import { TrendingUp, Shield, Users, Clock, Zap, ExternalLink } from "lucide-react"

import {
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  DollarSign,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { YieldAPI, type YieldItem, type BestRouteResponse } from "@/lib/api/yield-api";

import { useLoading } from "./layout/loading-context";
import { formatFees, formatNumber, formatPercent, formatUSD } from "@/lib/helpers/formatters";
import { useEffect, useState } from "react";
import { calculateReturns } from "@/lib/helpers/calculators";



interface YieldRoutesProps {
  token: Token;
  amount: number;
  riskProfile: "low" | "moderate" | "high";
}


export function YieldRoutes({
  token,
  amount,
  riskProfile,
}: YieldRoutesProps) {
  const [bestResponse, setBestResponse] = useState<BestRouteResponse | null>(null);

  const [allYields, setAllYields] = useState<YieldItem[]>([]);
  const [isLoadingBest, setIsLoadingBest] = useState(true);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setIsLoading } = useLoading();

  // Fetch best route first
  useEffect(() => {
    const controller = new AbortController();
    const connection: any = typeof navigator !== 'undefined' ? (navigator as any).connection : null;
    const isMetered = !!(connection?.saveData) || ["slow-2g", "2g"].includes(connection?.effectiveType);
    const debounceMs = isMetered ? 600 : 400;
    const timer = setTimeout(() => {
      const fetchBest = async () => {
        try {
          setIsLoadingBest(true);
          setIsLoading(true);
          setError(null);

          const best = await YieldAPI.getBestRoute(
            {
              asset: token.symbol,
              amount,
              riskProfile,
            },
            { signal: controller.signal }
          );
          if (!controller.signal.aborted) {
            setBestResponse(best);
          }
        } catch (err: any) {
          if (err?.name === "AbortError") return;
          const message = err instanceof Error ? err.message : "Failed to load best route";
          setError(message);
          console.error(err);
        } finally {
          if (!controller.signal.aborted) {
            setIsLoadingBest(false);
            setIsLoading(false);
          }
        }
      };
      fetchBest();
    }, debounceMs);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [token.symbol, amount, riskProfile, setIsLoading]);

  // Fetch all yields in background
  useEffect(() => {
    if (!bestResponse) return;
    const connection: any = typeof navigator !== 'undefined' ? (navigator as any).connection : null;
    const isMetered = !!(connection?.saveData) || ["slow-2g", "2g"].includes(connection?.effectiveType);
    if (isMetered) {
      // Skip background fetching on metered connections to save data
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      const fetchAll = async () => {
        setIsLoadingAll(true);
        try {
          const all = await YieldAPI.getAllYields(
            {
              asset: token.symbol,
              amount,
              limit: 50,
            },
            { signal: controller.signal }
          );
          if (!controller.signal.aborted) {
            setAllYields(all);
          }
        } catch (err: any) {
          if (err?.name !== "AbortError") {
            console.warn("Failed to load additional yields", err);
          }
        } finally {
          if (!controller.signal.aborted) {
            setIsLoadingAll(false);
          }
        }
      };
      fetchAll();
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [bestResponse, token.symbol, amount]);

  // Safe route list
  const bestRoute = bestResponse?.data?.bestRoute;
  // const alternatives = bestResponse?.data?.alternativeRoutes || [];
  const safeAllYields = Array.isArray(allYields) ? allYields : [];

  const displayedRoutes: YieldItem[] = bestRoute
    ? [
      bestRoute,
      // ...alternatives,
      ...safeAllYields.filter(
        (r): r is YieldItem =>
          !!r.protocol && (!bestRoute.protocol || r.protocol !== bestRoute.protocol)
      ),
    ]
    : [];

  const hasRoutes = displayedRoutes.length > 0;


  const filteredRoutes = displayedRoutes.filter((r) => {
    if (riskProfile === "low") return r.risk === "low"
    if (riskProfile === "moderate") return r.risk === "low" || r.risk === "moderate"
    return true
  })


  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-risk-low"
      case "moderate": return "text-risk-moderate"
      case "high": return "text-risk-high"
      default: return "text-muted-foreground"
    }
  }

  if (isLoadingBest) {
    if (isLoadingBest) {
      return (
        <div className="relative p-1">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary" />

          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 border border-primary/10 bg-card/80 p-4 sm:p-8 backdrop-blur-sm">

            <div className="text-center">
              <p className="text-sm sm:text-base font-bold text-foreground uppercase tracking-wide">
                Finding best routes...
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                Scanning {token.symbol} yield opportunities
              </p>
            </div>

          </div>
        </div>
      )
    }
  }

  if (error && !hasRoutes) {
    return (
      <div className="relative p-1">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-destructive" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-destructive" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-destructive" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-destructive" />

        <div className="border border-destructive/10 bg-destructive/3 backdrop-blur-sm p-4 sm:p-8 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div>
            <p className="font-semibold text-destructive text-epic">Failed to load yields</p>
            <p className="text-sm text-muted-foreground ">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasRoutes) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/80 p-8 text-center">
        <p className="text-muted-foreground">No yield routes available for {token.symbol}.</p>
      </div>
    );
  }



  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-primary" />
          <span className="font-mono text-xs text-muted-foreground tracking-wider uppercase">
            {displayedRoutes.length} Routes Available {isLoadingAll && " • Loading more..."}


            {/* {displayedRoutes.length} route{displayedRoutes.length !== 1 ? "s" : ""} for {amount} {token.symbol}
              {isLoadingAll && " • Loading more..."} */}
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          {formatNumber(amount)} {token.symbol}
        </span>
      </div>

      {/* Routes */}
      <div className="space-y-2">
        {displayedRoutes.map((route, index) => (
          // <div
          //   key={`${route.protocol}-${index}`}
          //   className={cn(
          //     "relative border border-border/40 bg-card/60 backdrop-blur-sm",
          //     "hover:border-primary/40 hover:bg-card/80 transition-all group",
          //     index === 0 && "border-primary/30 bg-primary/5"
          //   )}
          // >
          //   {/* Best badge */}
          //   {index === 0 && (
          //     <div className="absolute -top-px -right-px">
          //       <div className="bg-primary px-2 py-0.5 font-mono text-[9px] text-primary-foreground uppercase tracking-wider">
          //         Best
          //       </div>
          //     </div>
          //   )}


          <div
            key={`${route.protocol}-${index}`}
            className={cn(
              "group relative border border-border/50 bg-card/80 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card",
              index === 0 && "border-primary/30 bg-card animate-pulse-glow"
            )}
          >
            {index === 0 && (
              <div className="absolute -top-2 left-3 px-2 py-0.5 bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-wider">
                Best APY
              </div>
            )}


            {/* Corner accents on hover */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/0 group-hover:border-primary/60 transition-colors" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/0 group-hover:border-primary/60 transition-colors" />

            <div className="p-3">
              {/* Top row: Protocol + APY */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-secondary border border-border/50 flex items-center justify-center font-mono text-xs font-bold text-foreground">
                    {route.protocol.charAt(0)}
                  </div>
                  <div>
                    <div className="font-mono text-sm font-medium text-foreground capitalize">
                      {route.protocol}
                    </div>


                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("font-mono text-[10px] uppercase", route.riskColor, route.riskBg)}>
                        {route.risk}
                      </span>
                      {route.audited && (
                        <span className="flex items-center gap-0.5 text-[10px] text-primary">
                          <Shield className="w-2.5 h-2.5" />
                          <span>Audited</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 font-mono text-xl font-bold text-primary">
                    <TrendingUp className="w-4 h-4" />
                    {formatPercent(route.apy * 100)}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground uppercase">APY</div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-4 gap-2 mb-3 py-2 border-t border-b border-border/30">
                <div>
                  <div className="font-mono text-[10px] text-muted-foreground uppercase mb-0.5">TVL</div>
                  <div className="font-mono text-xs text-foreground">{formatUSD(route.tvl)}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-muted-foreground uppercase mb-0.5 flex items-center gap-1">
                    <Users className="w-2.5 h-2.5" />
                    Users
                  </div>
                  <div className="font-mono text-xs text-foreground">{route.users}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-muted-foreground uppercase mb-0.5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    Lock
                  </div>
                  <div className="font-mono text-xs text-foreground">{route.lockPeriod}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-muted-foreground uppercase mb-0.5 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" />
                    Fees
                  </div>
                  <div className="font-mono text-xs text-foreground">{formatFees(route.fees)}</div>
                </div>
              </div>

              {/* Projected returns */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground">Daily</div>
                    <div className="font-mono text-xs text-foreground">{calculateReturns({ amount, yearlyAPY: route.apy }).dailyUSD}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground">Weekly</div>
                    <div className="font-mono text-xs text-foreground">{calculateReturns({ amount, yearlyAPY: route.apy }).weeklyUSD}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground">Monthly</div>
                    <div className="font-mono text-xs text-foreground">{formatUSD(route.estimatedMonthlyReturn)}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-muted-foreground">Yearly</div>
                    <div className="font-mono text-xs font-medium text-primary">{formatUSD(route.estimatedYearlyReturn)}</div>
                  </div>
                </div>

                <button
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-medium transition-all",
                    index === 0
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border/50 text-foreground hover:border-primary/50 hover:text-primary"
                  )}
                >
                  Deposit
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
