import { TrendingUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface YieldPool {
  id: string;
  token: string;
  protocol: string;
  apy: number;
  risk: "low" | "medium" | "high";
  tvl: string;
}

const topYields: YieldPool[] = [
  { id: "1", token: "SOL", protocol: "Kamino", apy: 28.5, risk: "medium", tvl: "$142M" },
  { id: "2", token: "USDC", protocol: "Marginfi", apy: 18.2, risk: "low", tvl: "$89M" },
  { id: "3", token: "jitoSOL", protocol: "Drift", apy: 15.8, risk: "medium", tvl: "$67M" },
  { id: "4", token: "mSOL", protocol: "Solend", apy: 12.4, risk: "low", tvl: "$234M" },
  { id: "5", token: "BONK", protocol: "Meteora", apy: 45.2, risk: "high", tvl: "$12M" },
  { id: "6", token: "WIF", protocol: "Raydium", apy: 38.7, risk: "high", tvl: "$8M" },
];

const riskColors = {
  low: "text-success bg-success/10 border-success/30",
  medium: "text-warning bg-warning/10 border-warning/30",
  high: "text-destructive bg-destructive/10 border-destructive/30",
};

export function TopYieldsContent() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">Top Yields</h3>
        <span className="text-xs text-muted-foreground font-mono">Highest APY pools</span>
      </div>

      <div className="border border-border/50 bg-card/50 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-secondary/30 border-b border-border/50">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Token</span>
          <span className="font-mono text-[10px] text-muted-foreground uppercase">Protocol</span>
          <span className="font-mono text-[10px] text-muted-foreground uppercase text-right">APY</span>
          <span className="font-mono text-[10px] text-muted-foreground uppercase text-center">Risk</span>
          <span className="font-mono text-[10px] text-muted-foreground uppercase text-right">TVL</span>
        </div>

        {/* Rows */}
        {topYields.map((pool, index) => (
          <div
            key={pool.id}
            className={cn(
              "grid grid-cols-5 gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors cursor-pointer group",
              index !== topYields.length - 1 && "border-b border-border/30"
            )}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-mono font-bold text-primary">
                {pool.token.slice(0, 2)}
              </div>
              <span className="font-mono text-sm text-foreground">{pool.token}</span>
            </div>
            <span className="font-mono text-xs text-muted-foreground">{pool.protocol}</span>
            <span className="font-mono text-sm font-bold text-success text-right">{pool.apy}%</span>
            <div className="flex justify-center">
              <span className={cn("px-2 py-0.5 text-[10px] font-mono border rounded-sm", riskColors[pool.risk])}>
                {pool.risk}
              </span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="font-mono text-xs text-muted-foreground">{pool.tvl}</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
