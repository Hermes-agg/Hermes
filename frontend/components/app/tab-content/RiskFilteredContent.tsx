import { Shield, AlertTriangle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface YieldPool {
  id: string;
  token: string;
  protocol: string;
  apy: number;
  risk: "low" | "medium" | "high";
  tvl: string;
  riskScore: number;
}

const allPools: YieldPool[] = [
  { id: "1", token: "jitoSOL", protocol: "Jito", apy: 8.2, risk: "low", tvl: "$1.8B", riskScore: 2 },
  { id: "2", token: "mSOL", protocol: "Marinade", apy: 7.8, risk: "low", tvl: "$890M", riskScore: 2 },
  { id: "3", token: "USDC", protocol: "Solend", apy: 5.4, risk: "low", tvl: "$234M", riskScore: 3 },
  { id: "4", token: "SOL", protocol: "Kamino", apy: 28.5, risk: "high", tvl: "$142M", riskScore: 8 },
  { id: "5", token: "BONK", protocol: "Meteora", apy: 45.2, risk: "high", tvl: "$12M", riskScore: 9 },
  { id: "6", token: "WIF", protocol: "Raydium", apy: 38.7, risk: "high", tvl: "$8M", riskScore: 9 },
  { id: "7", token: "USDT", protocol: "Marginfi", apy: 6.2, risk: "low", tvl: "$156M", riskScore: 3 },
  { id: "8", token: "PYTH", protocol: "Drift", apy: 32.1, risk: "high", tvl: "$45M", riskScore: 8 },
];

interface RiskFilteredContentProps {
  riskLevel: "low" | "high";
}

const riskColors = {
  low: "text-success bg-success/10 border-success/30",
  medium: "text-warning bg-warning/10 border-warning/30",
  high: "text-destructive bg-destructive/10 border-destructive/30",
};

export function RiskFilteredContent({ riskLevel }: RiskFilteredContentProps) {
  const filteredPools = allPools
    .filter((pool) => riskLevel === "low" ? pool.risk === "low" : pool.risk === "high")
    .sort((a, b) => b.apy - a.apy);

  const isLowRisk = riskLevel === "low";

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        {isLowRisk ? (
          <Shield className="h-4 w-4 text-success" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-destructive" />
        )}
        <h3 className="font-display text-lg font-semibold text-foreground">
          {isLowRisk ? "Low Risk" : "High Risk"} Yields
        </h3>
        <span className="text-xs text-muted-foreground font-mono">
          Sorted by APY • {filteredPools.length} pools
        </span>
      </div>

      {isLowRisk && (
        <div className="mb-4 p-3 border border-success/30 bg-success/5 rounded-sm">
          <p className="text-xs text-success font-mono">
            These pools have been audited and have a proven track record. Lower APY but safer.
          </p>
        </div>
      )}

      {!isLowRisk && (
        <div className="mb-4 p-3 border border-destructive/30 bg-destructive/5 rounded-sm">
          <p className="text-xs text-destructive font-mono">
            Higher returns come with higher risks. DYOR before depositing.
          </p>
        </div>
      )}

      <div className="border border-border/50 bg-card/50 overflow-hidden">
        {filteredPools.map((pool, index) => (
          <div
            key={pool.id}
            className={cn(
              "flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer group",
              index !== filteredPools.length - 1 && "border-b border-border/30"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground w-4">{index + 1}</span>
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-mono font-bold text-primary">
                {pool.token.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-foreground">{pool.token}</span>
                  <span className={cn("px-1.5 py-0.5 text-[10px] font-mono border rounded-sm", riskColors[pool.risk])}>
                    {pool.riskScore}/10
                  </span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{pool.protocol}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-mono text-lg font-bold text-success">{pool.apy}%</div>
                <div className="font-mono text-[10px] text-muted-foreground">TVL {pool.tvl}</div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
