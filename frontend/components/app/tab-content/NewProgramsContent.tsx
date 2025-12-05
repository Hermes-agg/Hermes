import { Sparkles, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewProgram {
  id: string;
  name: string;
  protocol: string;
  token: string;
  apy: number;
  launchDate: string;
  tvl: string;
  isHot: boolean;
}

const newPrograms: NewProgram[] = [
  { id: "1", name: "SOL Super Staker", protocol: "Sanctum", token: "SOL", apy: 18.5, launchDate: "2 days ago", tvl: "$2.4M", isHot: true },
  { id: "2", name: "USDC Vault v3", protocol: "Kamino", token: "USDC", apy: 12.8, launchDate: "5 days ago", tvl: "$8.2M", isHot: true },
  { id: "3", name: "mSOL Boost", protocol: "Marinade", token: "mSOL", apy: 14.2, launchDate: "1 week ago", tvl: "$5.6M", isHot: false },
  { id: "4", name: "Drift Insurance Pool", protocol: "Drift", token: "USDC", apy: 22.4, launchDate: "3 days ago", tvl: "$1.2M", isHot: true },
  { id: "5", name: "RAY LP Optimizer", protocol: "Raydium", token: "RAY", apy: 35.8, launchDate: "4 days ago", tvl: "$890K", isHot: false },
];

export function NewProgramsContent() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">New Programs</h3>
        <span className="text-xs text-muted-foreground font-mono">Recently launched yield farms</span>
      </div>

      <div className="grid gap-3">
        {newPrograms.map((program) => (
          <div
            key={program.id}
            className={cn(
              "border border-border/50 bg-card/50 p-4 hover:border-primary/30 transition-colors cursor-pointer group",
              program.isHot && "border-primary/30 bg-primary/5"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-medium text-foreground">{program.name}</span>
                  {program.isHot && (
                    <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-wider">
                      Hot
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                  <span>{program.protocol}</span>
                  <span>•</span>
                  <span className="text-primary">{program.token}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {program.launchDate}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-xl font-bold text-success">{program.apy}%</div>
                <div className="font-mono text-[10px] text-muted-foreground">TVL {program.tvl}</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
              <span className="text-[10px] text-warning font-mono">
                ⚠️ New program - DYOR
              </span>
              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
