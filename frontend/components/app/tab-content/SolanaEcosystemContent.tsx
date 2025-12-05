import { Layers, Zap, Shield, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface EcosystemCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  yields: {
    name: string;
    apy: number;
    protocol: string;
  }[];
}

const ecosystemCategories: EcosystemCategory[] = [
  {
    id: "restaking",
    title: "SOL Restaking",
    description: "Stake SOL and earn additional rewards",
    icon: <Layers className="h-4 w-4" />,
    yields: [
      { name: "Native Restaking", apy: 12.5, protocol: "Jito" },
      { name: "Validator Boost", apy: 9.8, protocol: "Marinade" },
    ],
  },
  {
    id: "lst",
    title: "Liquid Staking (LSTs)",
    description: "Liquid staking tokens with DeFi utility",
    icon: <Gem className="h-4 w-4" />,
    yields: [
      { name: "jitoSOL", apy: 8.2, protocol: "Jito" },
      { name: "mSOL", apy: 7.8, protocol: "Marinade" },
      { name: "bSOL", apy: 7.5, protocol: "Blaze" },
    ],
  },
  {
    id: "mev",
    title: "MEV Rewards",
    description: "Earn from MEV extraction",
    icon: <Zap className="h-4 w-4" />,
    yields: [
      { name: "MEV Tips", apy: 3.2, protocol: "Jito" },
      { name: "MEV Vault", apy: 5.8, protocol: "Drift" },
    ],
  },
  {
    id: "lrt",
    title: "Liquid Restaking (LRTs)",
    description: "Restake LSTs for additional yield",
    icon: <Shield className="h-4 w-4" />,
    yields: [
      { name: "ezSOL", apy: 14.2, protocol: "Sanctum" },
      { name: "INF", apy: 11.8, protocol: "Sanctum" },
    ],
  },
];

export function SolanaEcosystemContent() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-4 w-4 text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">Solana Ecosystem</h3>
        <span className="text-xs text-muted-foreground font-mono">Staking, LSTs, MEV, LRTs</span>
      </div>

      <div className="grid gap-4">
        {ecosystemCategories.map((category) => (
          <div
            key={category.id}
            className="border border-border/50 bg-card/50 overflow-hidden"
          >
            <div className="px-4 py-3 bg-secondary/30 border-b border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-primary">{category.icon}</span>
                <h4 className="font-mono text-sm font-medium text-foreground">{category.title}</h4>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{category.description}</p>
            </div>

            <div className="divide-y divide-border/30">
              {category.yields.map((yield_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-foreground">{yield_.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">on {yield_.protocol}</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-success">{yield_.apy}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
