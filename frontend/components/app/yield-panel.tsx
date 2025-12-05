"use client"


import { useState, useMemo, useEffect } from "react";
import { RiskMeter } from "./RiskMeter";
import { cn } from "@/lib/utils";

import { TokenSelector, type Token } from "./TokenSelector";
import { YieldRoutes } from "./yield-routes";

const tokens: Token[] = [
  { symbol: "SOL", name: "Solana", icon: "/solana-logo.png", balance: 12.5 },
  { symbol: "USDC", name: "USD Coin", icon: "/usdc-logo.png", balance: 1250.0 },
  { symbol: "USDT", name: "Tether", icon: "/usdt-logo.png", balance: 500.0 },
  { symbol: "jitoSOL", name: "Jito Staked SOL", icon: "/jito-logo.png", balance: 5.2 },
  { symbol: "mSOL", name: "Marinade SOL", icon: "/marinade-logo.png", balance: 3.1 },
];

type RiskProfile = "low" | "moderate" | "high";

function formatNumber(num: number): string {
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function YieldPanel() {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [amount, setAmount] = useState("");
  const [riskProfile, setRiskProfile] = useState<RiskProfile>("moderate");
  const [showRoutes, setShowRoutes] = useState(false);

  const numericAmount = useMemo(() => {
    const parsed = Number.parseFloat(amount.replace(",", ""));
    return isNaN(parsed) ? 0 : parsed;
  }, [amount]);

  useEffect(() => {
    if (numericAmount > 0) {
      setShowRoutes(false);
      const timer = setTimeout(() => {
        setShowRoutes(true);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setShowRoutes(false);
    }
  }, [numericAmount, selectedToken]);

  const quickAmounts = ["25%", "50%", "75%"];

  const handleQuickAmount = (pct: string) => {
    const balance = selectedToken.balance;
    const percentage = Number.parseInt(pct);
    setAmount(((balance * percentage) / 100).toFixed(2));
  };

  return (
    <div className="flex flex-col gap-4 mx-auto max-w-2xl">
      <div className="relative border border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="border-b border-border/50 bg-secondary/30 px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-mono text-xs text-foreground tracking-widest uppercase mb-1">
                Yield Explorer
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary" />
                <h3 className="font-mono text-[10px] text-muted-foreground tracking-wider">
                  Discover Crypto Yields
                </h3>
              </div>
            </div>

            <RiskMeter value={riskProfile} onChange={setRiskProfile} />
          </div>
        </div>

        {/* Token Input Section */}
        <div className="border-2 border-border/50 bg-card p-3 m-3">
          {/* Balance Row with Quick Buttons */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-muted-foreground font-mono text-xs uppercase tracking-wide shrink-0">
              Deposit
            </span>

            <div className="flex items-center gap-1">
              {/* Quick Amount Buttons */}
              <div className="flex items-center gap-1">
                {quickAmounts.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handleQuickAmount(pct)}
                    className="px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/30"
                  >
                    {pct}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setAmount(String(selectedToken.balance))}
                className="text-muted-foreground transition-colors hover:text-primary text-right font-mono text-xs shrink-0 flex items-center gap-1"
              >
                <span className="text-[10px] text-primary">Max</span>
                <span className="text-foreground font-medium">
                  {formatNumber(selectedToken.balance)}
                </span>
                <span className="text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap max-w-10">
                  {selectedToken.symbol}
                </span>
              </button>
            </div>
          </div>

          {/* Input + Token Selector */}
          <div className="flex items-center gap-2 min-w-0">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="min-w-0 flex-1 bg-transparent text-2xl sm:text-3xl font-bold text-foreground outline-none placeholder:text-muted-foreground/50 font-mono"
            />
            <TokenSelector tokens={tokens} selectedToken={selectedToken} onSelect={setSelectedToken} />
          </div>
        </div>
      </div>

      {/* Yield Routes */}
      {showRoutes && numericAmount > 0 && (
        <YieldRoutes token={selectedToken} amount={numericAmount} riskProfile={riskProfile} />
      )}
    </div>
  );
}
