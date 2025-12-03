import { ArrowUpRight, TrendingUp, Shield } from "lucide-react"

export function TopStrategies() {
  const strategies = [
    {
      name: "LST Staking",
      platform: "Marinade Finance",
      apy: "8.5%",
      actualYield: "7.2%",
      risk: "Low",
      description: "Liquid staking with daily rewards",
      users: "12.5K",
    },
    {
      name: "LP Farming",
      platform: "Orca",
      apy: "18.3%",
      actualYield: "14.1%",
      risk: "Medium",
      description: "SOL/USDC liquidity pool rewards",
      users: "8.3K",
    },
    {
      name: "Lending",
      platform: "Lending Protocol",
      apy: "12.7%",
      actualYield: "10.8%",
      risk: "Medium",
      description: "Supply SOL, earn interest",
      users: "15.2K",
    },
    {
      name: "Yield Vault",
      platform: "Raydium",
      apy: "22.1%",
      actualYield: "16.5%",
      risk: "High",
      description: "Concentrated liquidity pools",
      users: "5.1K",
    },
  ]

  return (
    <section id="strategies" className="py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Top Yield Strategies</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategies.map((strategy, idx) => (
            <div
              key={idx}
              className="group relative bg-card rounded-xl border border-border/50 hover:border-accent/50 p-6 transition hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{strategy.name}</h3>
                  <p className="text-sm text-foreground/60">{strategy.platform}</p>
                </div>
                <div className="flex-shrink-0">
                  {strategy.risk === "Low" && (
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Shield size={16} className="text-green-500" />
                    </div>
                  )}
                  {strategy.risk === "Medium" && (
                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <TrendingUp size={16} className="text-yellow-500" />
                    </div>
                  )}
                  {strategy.risk === "High" && (
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                      <TrendingUp size={16} className="text-red-500" />
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-foreground/70 mb-6">{strategy.description}</p>

              <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-border/30">
                <div>
                  <div className="text-2xl font-bold text-accent">{strategy.actualYield}</div>
                  <div className="text-xs text-foreground/60">Actual Yield</div>
                </div>
                <div>
                  <div className="text-sm line-through text-foreground/40">{strategy.apy}</div>
                  <div className="text-xs text-foreground/60">Listed APY</div>
                </div>
                <div>
                  <div className="text-sm text-foreground">{strategy.users}</div>
                  <div className="text-xs text-foreground/60">Users</div>
                </div>
              </div>

              <button className="w-full py-2 px-4 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent hover:text-accent-foreground transition">
                Invest Now <ArrowUpRight className="inline ml-1" size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
