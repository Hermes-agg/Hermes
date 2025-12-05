import { Flame, TrendingUp, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendingItem {
  id: string;
  title: string;
  type: "apy-spike" | "tvl-pump" | "social" | "whale";
  change: string;
  protocol: string;
  token: string;
  time: string;
}

const trendingItems: TrendingItem[] = [
  { id: "1", title: "APY Spike", type: "apy-spike", change: "+245%", protocol: "Kamino", token: "SOL", time: "2h ago" },
  { id: "2", title: "TVL Surge", type: "tvl-pump", change: "+$12M", protocol: "Drift", token: "USDC", time: "4h ago" },
  { id: "3", title: "Whale Entry", type: "whale", change: "500K SOL", protocol: "Jito", token: "jitoSOL", time: "1h ago" },
  { id: "4", title: "Social Buzz", type: "social", change: "+1.2K mentions", protocol: "Marginfi", token: "mSOL", time: "30m ago" },
  { id: "5", title: "APY Spike", type: "apy-spike", change: "+89%", protocol: "Meteora", token: "BONK", time: "6h ago" },
];

const typeIcons = {
  "apy-spike": <TrendingUp className="h-4 w-4" />,
  "tvl-pump": <Wallet className="h-4 w-4" />,
  "social": <Users className="h-4 w-4" />,
  "whale": <Wallet className="h-4 w-4" />,
};

const typeColors = {
  "apy-spike": "text-success bg-success/10 border-success/30",
  "tvl-pump": "text-primary bg-primary/10 border-primary/30",
  "social": "text-warning bg-warning/10 border-warning/30",
  "whale": "text-accent bg-accent/10 border-accent/30",
};

export function TrendingContent() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="h-4 w-4 text-warning" />
        <h3 className="font-display text-lg font-semibold text-foreground">Trending</h3>
        <span className="text-xs text-muted-foreground font-mono">Real-time activity</span>
      </div>

      <div className="grid gap-3">
        {trendingItems.map((item) => (
          <div
            key={item.id}
            className="border border-border/50 bg-card/50 p-3 hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-sm border", typeColors[item.type])}>
                  {typeIcons[item.type]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-foreground font-medium">{item.title}</span>
                    <span className="font-mono text-xs text-success font-bold">{item.change}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[10px] text-muted-foreground">{item.protocol}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-mono text-[10px] text-primary">{item.token}</span>
                  </div>
                </div>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground shrink-0">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
