"use client"

import { useState, useMemo, useEffect } from "react"
import { TokenSelector, type Token } from "@/components/app/token-selector"
import { YieldRoutes } from "@/components/app/yield-routes"
import { Zap } from "lucide-react"

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
  const [isLoading, setIsLoading] = useState(false)
  const [showRoutes, setShowRoutes] = useState(false)

  const numericAmount = useMemo(() => {
    const parsed = Number.parseFloat(amount.replace(",", ""))
    return isNaN(parsed) ? 0 : parsed
  }, [amount])

  useEffect(() => {
    if (numericAmount > 0) {
      setIsLoading(true)
      setShowRoutes(false)
      const timer = setTimeout(() => {
        setIsLoading(false)
        setShowRoutes(true)
      }, 800)
      return () => clearTimeout(timer)
    } else {
      setShowRoutes(false)
      setIsLoading(false)
    }
  }, [numericAmount, selectedToken])

  return (
    <div className="flex flex-col gap-6">
      <div className="">
        <div className="">
          <div className="mb-4 flex gap-2 sm:mb-6 flex-row sm:items-center justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-base sm:text-lg font-semibold text-foreground">Find Yield Opportunities</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Trusted protocols only</p>
            </div>
            {/* <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-primary whitespace-nowrap">
              <Zap className="h-3 w-3 flex-shrink-0" />
              <span className="hidden sm:inline">Live</span>
            </div> */}
          </div>

          {/* Token input */}
          <div className="rounded-xl border border-border/50 bg-secondary/50 p-3 sm:p-4">
            <div className="mb-2 sm:mb-3 flex gap-1 sm:items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">You deposit</span>
              <button
                onClick={() => setAmount(selectedToken.balance.replace(",", ""))}
                className="text-muted-foreground transition-colors hover:text-primary text-left"
              >
                Balance:{" "}
                <span className="font-medium text-foreground">
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
                className="min-w-0 flex-1 bg-transparent text-xl sm:text-3xl font-semibold text-foreground outline-none placeholder:text-muted-foreground/50"
              />
              <TokenSelector tokens={tokens} selectedToken={selectedToken} onSelect={setSelectedToken} />
            </div>
            {/* Quick amount buttons */}
            <div className="mt-3 sm:mt-4 flex gap-1.5 sm:gap-2">
              {["25%", "50%", "75%", "Max"].map((pct) => (
                <button
                  key={pct}
                  onClick={() => {
                    const balance = Number.parseFloat(selectedToken.balance.replace(",", ""))
                    const percentage = pct === "Max" ? 100 : Number.parseInt(pct)
                    setAmount(((balance * percentage) / 100).toFixed(2))
                  }}
                  className="flex-1 rounded-lg border border-border/50 bg-background/50 py-1.5 sm:py-2 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                >
                  {pct}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 rounded-2xl border border-border/50 bg-card/80 p-4 sm:p-8 backdrop-blur-sm card-glow">
          <div className="relative h-10 w-10 sm:h-12 sm:w-12">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
            <div
              className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-t-primary/60"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            />
          </div>
          <div className="text-center">
            <p className="text-sm sm:text-base font-medium text-foreground">Finding best routes...</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Scanning {selectedToken.symbol} yield opportunities
            </p>
          </div>
        </div>
      )}

      {/* Dynamic yield routes based on inputs */}
      {showRoutes && numericAmount > 0 && <YieldRoutes token={selectedToken} amount={numericAmount} />}
    </div>
  )
}
