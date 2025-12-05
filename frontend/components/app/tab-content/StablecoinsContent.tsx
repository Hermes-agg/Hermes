import { DollarSign, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StablecoinYield {
  id: string;
  symbol: string;
  name: string;
  protocol: string;
  apy: number;
  tvl: string;
  utilization: number;
}

const stablecoinYields: StablecoinYield[] = [
  { id: "1", symbol: "USDC", name: "USD Coin", protocol: "Marginfi", apy: 18.2, tvl: "$89M", utilization: 78 },
  { id: "2", symbol: "USDC", name: "USD Coin", protocol: "Kamino", apy: 15.4, tvl: "$142M", utilization: 82 },
  { id: "3", symbol: "USDT", name: "Tether", protocol: "Solend", apy: 12.8, tvl: "$67M", utilization: 71 },
  { id: "4", symbol: "USDC", name: "USD Coin", protocol: "Drift", apy: 22.4, tvl: "$45M", utilization: 89 },
  { id: "5", symbol: "PYUSD", name: "PayPal USD", protocol: "Kamino", apy: 8.5, tvl: "$12M", utilization: 45 },
  { id: "6", symbol: "USDT", name: "Tether", protocol: "Marginfi", apy: 14.2, tvl: "$34M", utilization: 68 },
];

export function StablecoinsContent() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-4 w-4 text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">Stablecoin Yields</h3>
        <span className="text-xs text-muted-foreground font-mono">USDC, USDT, PYUSD</span>
      </div>

      <div className="mb-4 p-3 border border-primary/30 bg-primary/5 rounded-sm">
        <p className="text-xs text-primary font-mono">
          Stablecoin yields offer lower volatility risk. Returns may vary based on utilization rates.
        </p>
      </div>

      <div className="border border-border/50 bg-card/50 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-secondary/30 border-b border-border/50">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Token</span>
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Protocol</span>
          <span className="font-mono text-[10px] text-muted-foreground uppercase text-right">APY</span>
          <span className="font-mono text-[10px] text-muted-foreground uppercase text-center">Util.</span>
          <span className="font-mono text-[10px] text-muted-foreground uppercase text-right">TVL</span>
        </div>

        {stablecoinYields.map((yield_, index) => (
          <div
            key={yield_.id}
            className={cn(
              "grid grid-cols-5 gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors cursor-pointer",
              index !== stablecoinYields.length - 1 && "border-b border-border/30"
            )}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-[10px] font-mono font-bold text-success">
                $
              </div>
              <span className="font-mono text-sm text-foreground">{yield_.symbol}</span>
            </div>
            <span className="font-mono text-xs text-muted-foreground">{yield_.protocol}</span>
            <span className="font-mono text-sm font-bold text-success text-right">{yield_.apy}%</span>
            <div className="flex justify-center">
              <div className="w-full max-w-16">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      yield_.utilization > 80 ? "bg-warning" : "bg-primary"
                    )}
                    style={{ width: `${yield_.utilization}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{yield_.utilization}%</span>
              </div>
            </div>
            <span className="font-mono text-xs text-muted-foreground text-right">{yield_.tvl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
