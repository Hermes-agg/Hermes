import { Building2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Protocol {
  id: string;
  name: string;
  tvl: string;
  apyRange: string;
  riskScore: number;
  pools: number;
}

const protocols: Protocol[] = [
  { id: "1", name: "Kamino", tvl: "$892M", apyRange: "5-35%", riskScore: 7, pools: 24 },
  { id: "2", name: "Jito", tvl: "$1.8B", apyRange: "7-12%", riskScore: 3, pools: 8 },
  { id: "3", name: "Drift", tvl: "$456M", apyRange: "8-45%", riskScore: 8, pools: 32 },
  { id: "4", name: "Marginfi", tvl: "$678M", apyRange: "4-22%", riskScore: 5, pools: 18 },
  { id: "5", name: "Solend", tvl: "$234M", apyRange: "3-18%", riskScore: 4, pools: 15 },
  { id: "6", name: "Sanctum", tvl: "$567M", apyRange: "6-15%", riskScore: 4, pools: 12 },
  { id: "7", name: "Meteora", tvl: "$123M", apyRange: "10-80%", riskScore: 9, pools: 45 },
];

function getRiskColor(score: number) {
  if (score <= 4) return "text-success bg-success/10";
  if (score <= 7) return "text-warning bg-warning/10";
  return "text-destructive bg-destructive/10";
}

export function ProtocolsContent() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-4 w-4 text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">Protocols</h3>
        <span className="text-xs text-muted-foreground font-mono">{protocols.length} integrated</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {protocols.map((protocol) => (
          <div
            key={protocol.id}
            className="border border-border/50 bg-card/50 p-4 hover:border-primary/30 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-primary/20 flex items-center justify-center text-xs font-mono font-bold text-primary">
                  {protocol.name.slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-mono text-sm font-medium text-foreground">{protocol.name}</h4>
                  <span className="font-mono text-[10px] text-muted-foreground">{protocol.pools} pools</span>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="font-mono text-[10px] text-muted-foreground block">TVL</span>
                <span className="font-mono text-sm text-foreground">{protocol.tvl}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] text-muted-foreground block">APY Range</span>
                <span className="font-mono text-sm text-success">{protocol.apyRange}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] text-muted-foreground block">Risk</span>
                <span className={cn("font-mono text-sm px-1.5 py-0.5 rounded-sm inline-block", getRiskColor(protocol.riskScore))}>
                  {protocol.riskScore}/10
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
