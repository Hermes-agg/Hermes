"use client"

import { useState, useMemo, useEffect } from "react"
import { TokenSelector, type Token } from "@/components/app/token-selector"
import { YieldRoutes } from "@/components/app/yield-routes"
import { Zap } from "lucide-react"
import { useLoading } from "./layout/loading-context"

const tokens: Token[] = [
  { symbol: "SOL", name: "Solana", icon: "/solana-logo.png", balance: "12.5" },
  { symbol: "USDC", name: "USD Coin", icon: "/usdc-logo.png", balance: "1,250.00" },
  { symbol: "USDT", name: "Tether", icon: "/usdt-logo.png", balance: "500.00" },
  { symbol: "JitoSOL", name: "Jito Staked SOL", icon: "/jito-logo.png", balance: "5.2" },
  { symbol: "mSOL", name: "Marinade SOL", icon: "/marinade-logo.png", balance: "3.1" },
]

export function YieldPanel() {
  const [selectedToken, setSelectedToken] = useState(tokens[0])
  const [amount, setAmount] = useState("")
  // const { isLoading, setIsLoading } = useLoading()
  const [showRoutes, setShowRoutes] = useState(false)

  const numericAmount = useMemo(() => {
    const parsed = Number.parseFloat(amount.replace(",", ""))
    return isNaN(parsed) ? 0 : parsed
  }, [amount])

  useEffect(() => {
    if (numericAmount > 0) {
      // setIsLoading(true)
      setShowRoutes(false)
      const timer = setTimeout(() => {
        // setIsLoading(false)
        setShowRoutes(true)
      }, 800)
      return () => clearTimeout(timer)
    } else {
      setShowRoutes(false)
      // setIsLoading(false)
    }
  }, [numericAmount, selectedToken])

  return (
    <div className="flex flex-col gap-6 mx-auto max-w-2xl">
      {/* <div className="min-w-0">
        <h1 className="truncate text-base sm:text-lg font-semibold text-foreground text-heroic">Find Yield Opportunities</h1>
        <p className="text-xs sm:text-sm text-muted-foreground text-epic">Trusted protocols only</p>
      </div> */}

      <div className="min-w-0 space-y-0.5">
        <h1 className="truncate text-lg font-bold text-foreground w-fit bg-primary/1 backdrop-blur-sm">
          Find Yield Opportunities
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground w-fit bg-primary/1 backdrop-blur-sm">
          
          Trusted protocols only
         
        </p>
      </div>

      {/* Main input card - Angular blocky design */}

      <div className="relative">
        {/* Corner accents */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary/60" />
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary/60" />
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary/60" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary/60" />

        <div className="rounded-sm border border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden glow-gold">
          {/* Header bar */}
          <div className="flex items-center justify-between border-b border-border/50 bg-secondary/30 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <span className="font-divine text-xs uppercase tracking-[0.15em] text-primary">
                Yield Search
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="font-tech text-[10px] uppercase tracking-wider text-primary/70">
                Live
              </span>
            </div>
          </div>

            {/* Token input */}
            <div className="border-2 border-border/50 bg-card p-3 sm:p-4 text-tech">
              <div className="mb-2 sm:mb-3 flex gap-1 sm:items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground font-mono uppercase tracking-wide">You deposit</span>
                <button
                  onClick={() => setAmount(selectedToken.balance.replace(",", ""))}
                  className="text-muted-foreground transition-colors hover:text-primary text-left font-mono"
                >
                  Balance:{" "}
                  <span className="font-bold text-foreground">
                    {selectedToken.balance} {selectedToken.symbol}
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="min-w-0 flex-1 bg-transparent text-xl sm:text-3xl font-bold text-foreground outline-none placeholder:text-muted-foreground/50 font-mono"
                />

                <TokenSelector tokens={tokens} selectedToken={selectedToken} onSelect={setSelectedToken} />
              </div>

              {/* Quick amount buttons */}
              <div className="mt-3 sm:mt-4 grid grid-cols-4 gap-1.5 sm:gap-2">
                {["25%", "50%", "75%", "Max"].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      const balance = Number.parseFloat(selectedToken.balance.replace(",", ""))
                      const percentage = pct === "Max" ? 100 : Number.parseInt(pct)
                      setAmount(((balance * percentage) / 100).toFixed(2))
                    }}
                    className="border-2 border-border/50 bg-background/50 py-1.5 sm:py-2.5 text-xs font-bold text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-foreground uppercase tracking-wide"
                  >
                    {pct}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
</div>
      {/* Dynamic yield routes based on inputs */}
      {showRoutes && numericAmount > 0 && <YieldRoutes token={selectedToken} amount={numericAmount} />}
    </div>
  )
}
