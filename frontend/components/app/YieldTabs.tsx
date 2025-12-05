import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  Flame, 
  Building2, 
  Coins, 
  Shield, 
  AlertTriangle,
  Sparkles,
  DollarSign,
  Layers
} from "lucide-react";

export type TabId = 
  | "top-yields" 
  | "trending" 
  | "protocols" 
  | "hot-tokens" 
  | "low-risk" 
  | "high-risk" 
  | "new-programs" 
  | "stablecoins" 
  | "solana-ecosystem";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  color?: string;
}

const tabs: Tab[] = [
  { id: "top-yields", label: "Top Yields", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { id: "trending", label: "Trending", icon: <Flame className="h-3.5 w-3.5" />, color: "text-warning" },
  { id: "protocols", label: "Protocols", icon: <Building2 className="h-3.5 w-3.5" /> },
  { id: "hot-tokens", label: "Hot Tokens", icon: <Coins className="h-3.5 w-3.5" />, color: "text-warning" },
  { id: "low-risk", label: "Low Risk", icon: <Shield className="h-3.5 w-3.5" />, color: "text-success" },
  { id: "high-risk", label: "High Risk", icon: <AlertTriangle className="h-3.5 w-3.5" />, color: "text-destructive" },
  { id: "new-programs", label: "New", icon: <Sparkles className="h-3.5 w-3.5" />, color: "text-primary" },
  { id: "stablecoins", label: "Stablecoins", icon: <DollarSign className="h-3.5 w-3.5" /> },
  { id: "solana-ecosystem", label: "Solana", icon: <Layers className="h-3.5 w-3.5" /> },
];

interface YieldTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function YieldTabs({ activeTab, onTabChange }: YieldTabsProps) {
  return (
    <div className="sticky top-12 md:top-[58px] z-40 border-b border-border/30 bg-background/60 backdrop-blur-xl">

      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-wider whitespace-nowrap transition-all group",
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {/* Hover corners */}
                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Active corners */}
                {active && (
                  <>
                    <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-primary" />
                    <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t-2 border-r-2 border-primary" />
                    <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b-2 border-l-2 border-primary" />
                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-primary" />
                  </>
                )}
                
                <span className="flex items-center gap-1.5">
                  <span className={tab.color && active ? tab.color : ""}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
