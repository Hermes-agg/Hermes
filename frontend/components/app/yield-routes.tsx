"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
  DollarSign,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { YieldAPI, type YieldItem, type BestRouteResponse } from "@/lib/api/yield-api";
import type { Token } from "@/components/app/token-selector";
import { useLoading } from "./layout/loading-context";
import { formatPercent, formatUSD } from "@/lib/formatters";

interface YieldRoutesProps {
  token: Token;
  amount: number;
  riskProfile?: "low" | "moderate" | "high";
}

export function YieldRoutes({
  token,
  amount,
  riskProfile = "low",
}: YieldRoutesProps) {
  const [bestResponse, setBestResponse] = useState<BestRouteResponse | null>(null);
  const [allYields, setAllYields] = useState<YieldItem[]>([]);
  const [isLoadingBest, setIsLoadingBest] = useState(true);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setIsLoading } = useLoading();

  // Fetch best route first
  useEffect(() => {
    const fetchBest = async () => {
      try {
        setIsLoadingBest(true);
        setIsLoading(true);
        setError(null);

        const best = await YieldAPI.getBestRoute({
          asset: token.symbol,
          amount,
          riskProfile,
        });
        setBestResponse(best);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load best route";
        setError(message);
        console.error(err);
      } finally {
        setIsLoadingBest(false);
        setIsLoading(false);
      }
    };
    fetchBest();
  }, [token.symbol, amount, riskProfile, setIsLoading]);

  // Fetch all yields in background
  useEffect(() => {
    if (!bestResponse) return;

    const fetchAll = async () => {
      setIsLoadingAll(true);
      try {
        const all = await YieldAPI.getAllYields({
          asset: token.symbol,
          amount,
          limit: 50,
        });
        setAllYields(all);
      } catch (err) {
        console.warn("Failed to load additional yields", err);
      } finally {
        setIsLoadingAll(false);
      }
    };
    fetchAll();
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
    <div className="rounded-2xl backdrop-blur-sm">
      <div className="py-3 sm:py-4">
        <div className="flex gap-1 flex-row sm:items-center justify-between">
          <div className="min-w-0 space-y-0.5">
            <h2 className="truncate text-base sm:text-lg font-semibold text-foreground w-fit bg-primary/1 text-tech backdrop-blur-sm ">

              Best Routes

            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground w-fit bg-primary/1 backdrop-blur-sm ">
              
              Sorted by highest yield
             
            </p>
          </div>
          <div className="min-w-0 flex flex-col items-end justify-end">
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              {displayedRoutes.length} route{displayedRoutes.length !== 1 ? "s" : ""} for {amount} {token.symbol}
              {isLoadingAll && " • Loading more..."}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {displayedRoutes.map((route, index) => (
          <div
            key={`${route.protocol}-${index}`}
            className={cn(
              "transition-all hover:bg-secondary/30 flex flex-col gap-4 p-3 sm:p-4 border-2 border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all group relative overflow-hidden",
              index === 0 && "bg-primary/5"
            )}
          >
            {/* Mobile */}
            <div className="flex flex-col gap-3 sm:hidden">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-xs font-bold text-foreground h-8 w-8 bg-primary/20 border border-primary/30 flex items-center justify-center">
                    {route.protocol.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="truncate font-semibold text-sm text-foreground capitalize">
                        {route.protocol}
                      </span>
                      {index === 0 && (
                        <span className="flex items-center gap-0.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs font-medium text-primary flex-shrink-0">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          <span>Best</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <ShieldCheck className="h-3 w-3 text-primary" />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-lg sm:text-xl font-bold text-primary">
                    {formatPercent(route.apy * 100)}
                  </div>
                  <div className="text-xs text-muted-foreground">APY</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 rounded-xl text-xs">
                <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    TVL: {formatUSD(route.tvl)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    null users
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground flex-wrap">
                  <div>
                    <span className="text-muted-foreground">Monthly: </span>
                    <span className="font-medium text-foreground">{formatUSD(route.estimatedMonthlyReturn)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Yearly: </span>
                    <span className="font-medium text-primary">{formatUSD(route.estimatedYearlyReturn)}</span>
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
            </div>

            {/* Desktop */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 font-bold text-foreground bg-primary/20 border border-primary/30 items-center justify-center">
                        {route.protocol.charAt(0)}
                      </div>
                      <span className="truncate font-semibold text-foreground">
                        {route.protocol}
                      </span>
                      {index === 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                          <CheckCircle2 className="h-3 w-3" />
                          Best
                        </span>
                      )}
                      <span className="flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                        <TrendingUp className="h-5 w-5" />
                        {route.apy.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">APY</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        TVL: {route.tvl}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        null users
                      </span>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="hidden lg:block text-right">
                        <div className="text-sm text-muted-foreground">Est. Monthly</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Est. Yearly</div>
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
            </div>
          </div>
        ))}

        {/* Optional: subtle indicator when loading more */}
        {isLoadingAll && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading more opportunities...
          </div>
        )}
      </div>
    </div>
  );
}