"use client"

import { useState, useMemo, useEffect } from "react"
import { Zap } from "lucide-react"

// Mock types for the example
type Token = {
  symbol: string
  name: string
  icon: string
  balance: string
}

const tokens: Token[] = [
  { symbol: "SOL", name: "Solana", icon: "/solana-logo.png", balance: "12.5" },
  { symbol: "USDC", name: "USD Coin", icon: "/usdc-logo.png", balance: "1,250.00" },
  { symbol: "USDT", name: "Tether", icon: "/usdt-logo.png", balance: "500.00" },
  { symbol: "JitoSOL", name: "Jito Staked SOL", icon: "/jito-logo.png", balance: "5.2" },
  { symbol: "mSOL", name: "Marinade SOL", icon: "/marinade-logo.png", balance: "3.1" },
]

export default function YieldPanel() {
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
    <div className="flex flex-col gap-6 mx-auto max-w-2xl">
      {/* Main input card - Angular blocky design */}
      <div className="relative overflow-hidden bg-card/80 backdrop-blur-sm border-2 border-primary/20">
        {/* Sharp corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
        
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 bg-primary/20 blur-3xl" />
        
        <div className="relative py-5 sm:py-6">
          <div className="flex gap-2 mb-4 flex-row sm:items-center justify-between p-3 sm:p-4">
            <div className="min-w-0">
              <h1 className="truncate text-base sm:text-lg font-bold text-foreground tracking-tight uppercase">
                Find Yield Opportunities
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-mono">Trusted protocols only</p>
            </div>
            <div className="flex items-center gap-2 border-2 border-primary/30 bg-primary/10 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-primary whitespace-nowrap uppercase tracking-wide">
              <Zap className="h-3 w-3 flex-shrink-0" />
              <span className="hidden sm:inline">Live</span>
            </div>
          </div>

          {/* Token input - Sharp edges */}
          <div className="border-2 border-border/50 bg-secondary/50 p-3 sm:p-4 mx-3 sm:mx-4">
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
              
              {/* Token selector - blocky style */}
              <button className="flex items-center gap-2 border-2 border-border/50 bg-background/50 px-3 sm:px-4 py-2 sm:py-2.5 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                <div className="h-6 w-6 sm:h-7 sm:w-7 bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{selectedToken.symbol.charAt(0)}</span>
                </div>
                <span className="font-bold text-foreground text-sm sm:text-base">{selectedToken.symbol}</span>
                <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {/* Quick amount buttons - Sharp edges */}
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

      {/* Loading state - Angular design */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 border-2 border-border/50 bg-card/80 p-4 sm:p-8 backdrop-blur-sm relative">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary" />
          
          <div className="relative h-10 w-10 sm:h-12 sm:w-12">
            <div className="absolute inset-0 border-2 border-primary/20" />
            <div className="absolute inset-0 animate-spin border-2 border-transparent border-t-primary" />
            <div
              className="absolute inset-2 animate-spin border-2 border-transparent border-t-primary/60"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            />
          </div>
          <div className="text-center">
            <p className="text-sm sm:text-base font-bold text-foreground uppercase tracking-wide">Finding best routes...</p>
            <p className="text-xs sm:text-sm text-muted-foreground font-mono">
              Scanning {selectedToken.symbol} yield opportunities
            </p>
          </div>
        </div>
      )}

      {/* Mock yield routes display */}
      {showRoutes && numericAmount > 0 && (
        <div className="flex flex-col gap-4">
          {/* Route card example - blocky style */}
          <div className="border-2 border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all group relative overflow-hidden">
            {/* Corner indicators */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground uppercase tracking-tight">Marinade Finance</h3>
                  <p className="text-xs text-muted-foreground font-mono">Liquid Staking</p>
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-primary">7.2%</div>
                  <div className="text-xs text-muted-foreground font-mono uppercase">APY</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t-2 border-border/30">
                <div>
                  <div className="text-xs text-muted-foreground font-mono uppercase mb-1">TVL</div>
                  <div className="text-sm font-bold text-foreground">$2.4B</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-mono uppercase mb-1">Risk</div>
                  <div className="text-sm font-bold text-green-400">Low</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-mono uppercase mb-1">Liquidity</div>
                  <div className="text-sm font-bold text-foreground">High</div>
                </div>
              </div>

              <button className="w-full mt-4 bg-primary text-primary-foreground py-2.5 sm:py-3 font-bold uppercase tracking-wide hover:bg-primary/90 transition-all border-2 border-primary">
                Deposit {numericAmount} {selectedToken.symbol}
              </button>
            </div>
          </div>

          {/* Second route example */}
          <div className="border-2 border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all group relative">
            <div className="absolute top-0 left-0 w-2 h-2 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground uppercase tracking-tight">Jito</h3>
                  <p className="text-xs text-muted-foreground font-mono">MEV-Enhanced Staking</p>
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-primary">8.5%</div>
                  <div className="text-xs text-muted-foreground font-mono uppercase">APY</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t-2 border-border/30">
                <div>
                  <div className="text-xs text-muted-foreground font-mono uppercase mb-1">TVL</div>
                  <div className="text-sm font-bold text-foreground">$1.8B</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-mono uppercase mb-1">Risk</div>
                  <div className="text-sm font-bold text-yellow-400">Medium</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-mono uppercase mb-1">Liquidity</div>
                  <div className="text-sm font-bold text-foreground">High</div>
                </div>
              </div>

              <button className="w-full mt-4 bg-primary text-primary-foreground py-2.5 sm:py-3 font-bold uppercase tracking-wide hover:bg-primary/90 transition-all border-2 border-primary">
                Deposit {numericAmount} {selectedToken.symbol}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}