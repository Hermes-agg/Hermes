import { useState } from "react"
import { TrendingUp, Activity, Zap, Shield, BarChart3, ChevronUp, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface MarketStat {
  label: string
  value: string
  change?: string
  trend?: "up" | "down" | "neutral"
}

const marketStats: MarketStat[] = [
  { label: "Total TVL", value: "$4.2B", change: "+2.4%", trend: "up" },
  { label: "24h Volume", value: "$890M", change: "-1.2%", trend: "down" },
  { label: "Active Pools", value: "1,247", trend: "neutral" },
  { label: "Avg APY", value: "8.5%", change: "+0.3%", trend: "up" },
]

const topProtocols = [
  { name: "Marinade", tvl: "$1.2B", apy: "7.2%", change: "+12%" },
  { name: "Jito", tvl: "$890M", apy: "8.1%", change: "+8%" },
  { name: "Raydium", tvl: "$650M", apy: "15.4%", change: "-3%" },
  { name: "Orca", tvl: "$420M", apy: "12.8%", change: "+5%" },
]

const riskAlerts = [
  { level: "low", message: "SOL staking yields stable" },
  { level: "medium", message: "USDC pools seeing high demand" },
]

function SidebarContent({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      {/* Market Overview */}
      <div className="card-base inline border border-border/50">
        <div className="card-header border-b border-border/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span className="text-label uppercase">
              Market Overview
            </span>
          </div>
        </div>

        <div className="p-3 grid grid-cols-2 gap-3 bg-background/30">
          {marketStats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-sm font-bold text-foreground">
                  {stat.value}
                </span>
                {stat.change && (
                  <span
                    className={cn(
                      "font-mono text-[10px]",
                      stat.trend === "up" && "text-success",
                      stat.trend === "down" && "text-destructive"
                    )}
                  >
                    {stat.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Protocols */}
      <div className="card-base border border-border/50">

        <div className="card-header border-b border-border/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
            <span className="text-label uppercase">
              Top Protocols
            </span>
          </div>
        </div>

        <div className="p-2 bg-background/30">
          {topProtocols.map((protocol, idx) => (
            <div
              key={protocol.name}
              className={cn(
                "flex items-center justify-between px-2 py-2 transition-colors hover:bg-secondary/50",
                idx !== topProtocols.length - 1 && "border-b border-border/30"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground w-3">
                  {idx + 1}
                </span>
                <span className="font-mono text-xs text-foreground">
                  {protocol.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {protocol.tvl}
                </span>
                <span className="font-mono text-xs font-bold text-primary">
                  {protocol.apy}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MarketSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar - Right side */}
      <div className="w-full h-full  lg:flex flex-col  shrink-0 hidden pt-2 sticky top-0 lg:pt-4 max-sm:hidden">
        <aside className="gap-4 px-4  ">
          <SidebarContent />
        </aside>
      </div>

      {/* Mobile Bottom Sheet Trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden fixed bottom-30 right-5 z-50 flex items-center gap-1.5 px-3 py-2 card-base shadow-md backdrop-blur-sm">

            <Activity className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-foreground">
              Stats
            </span>
            <ChevronUp className="w-3 h-3 text-muted-foreground" />
          </button>
        </SheetTrigger>

        <SheetContent side="bottom" className="h-[70vh] p-0 border-t border-border/50 bg-background">

          {/* Sheet Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-background backdrop-blur-sm border-l shadow-[-12px_0_24px_-12px_hsl(var(--foreground)/0.08)] px-4 py-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs uppercase tracking-widest text-foreground">
                Market Analysis
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 hover:bg-secondary/50 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Sheet Content */}
          <div className="overflow-y-auto h-full pb-20 p-4">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
