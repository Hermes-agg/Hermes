import { Coins, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface HotToken {
  id: string;
  symbol: string;
  name: string;
  bestApy: number;
  protocol: string;
  priceChange: number;
  volume24h: string;
}

const hotTokens: HotToken[] = [
  { id: "1", symbol: "BONK", name: "Bonk", bestApy: 45.2, protocol: "Meteora", priceChange: 12.5, volume24h: "$89M" },
  { id: "2", symbol: "WIF", name: "dogwifhat", bestApy: 38.7, protocol: "Raydium", priceChange: -5.2, volume24h: "$156M" },
  { id: "3", symbol: "USDC", name: "USD Coin", bestApy: 18.2, protocol: "Marginfi", priceChange: 0.01, volume24h: "$2.1B" },
  { id: "4", symbol: "jitoSOL", name: "Jito SOL", bestApy: 15.8, protocol: "Kamino", priceChange: 3.4, volume24h: "$45M" },
  { id: "5", symbol: "mSOL", name: "Marinade SOL", bestApy: 12.4, protocol: "Solend", priceChange: 2.8, volume24h: "$32M" },
  { id: "6", symbol: "PYTH", name: "Pyth Network", bestApy: 22.1, protocol: "Drift", priceChange: 8.9, volume24h: "$67M" },
  { id: "7", symbol: "RAY", name: "Raydium", bestApy: 28.5, protocol: "Raydium", priceChange: -2.1, volume24h: "$23M" },
];

export function HotTokensContent() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Coins className="h-4 w-4 text-warning" />
        <h3 className="font-display text-lg font-semibold text-foreground">Hot Tokens</h3>
        <span className="text-xs text-muted-foreground font-mono">Highest yields right now</span>
      </div>

      <div className="grid gap-2">
        {hotTokens.map((token) => (
          <div
            key={token.id}
            className="border border-border/50 bg-card/50 p-3 hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-mono font-bold text-primary">
                  {token.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-foreground">{token.symbol}</span>
                    <span className={cn(
                      "flex items-center gap-0.5 font-mono text-[10px]",
                      token.priceChange >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {token.priceChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {token.priceChange >= 0 ? "+" : ""}{token.priceChange}%
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">{token.name}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-lg font-bold text-success">{token.bestApy}%</div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  on {token.protocol} • Vol {token.volume24h}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
