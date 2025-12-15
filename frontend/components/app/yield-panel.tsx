import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { RiskMeter } from "./RiskMeter";
import { TokenSelector, type Token } from "./TokenSelector";
import { YieldRoutes } from "./yield-routes";

const tokens: Token[] = [
  { symbol: "SOL", name: "Solana", icon: "/brand-logos/solanaLogoMark.svg", balance: 12.5 },
  { symbol: "USDC", name: "USD Coin", icon: "/brand-logos/usdcLogoMark.svg", balance: 1250.0 },
  { symbol: "USDT", name: "Tether", icon: "/brand-logos/tetherLogoMark.svg", balance: 500.0 },
  // { symbol: "jitoSOL", name: "Jito Staked SOL", icon: "/brand-logos/usdcLogoMark.svg", balance: 5.2 },
  // { symbol: "mSOL", name: "Marinade SOL", icon: "/brand-logos/usdcLogoMark.svg", balance: 3.1 },
];

type RiskProfile = "low" | "moderate" | "high";

function formatNumber(num: number): string {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setShowRoutes(false);
    }
  }, [numericAmount, selectedToken]);

  const quickAmounts = ["25%", "50%", "75%", "MAX"];

  const handleQuickAmount = (pct: string) => {
    const balance = selectedToken.balance;
    if (pct === "MAX") {
      setAmount(balance.toFixed(2));
      return;
    }
    const percentage = Number.parseInt(pct.replace("%", ""));
    setAmount(((balance * percentage) / 100).toFixed(2));
  };

  const getActiveQuickAmount = (pct: string) => {
    const balance = selectedToken.balance;
    if (pct === "MAX") return numericAmount === balance;
    const percentage = Number.parseInt(pct.replace("%", ""));
    return numericAmount === +((balance * percentage) / 100).toFixed(2);
  };

  return (
    <div className="flex flex-col gap-4 mx-auto max-w-2xl">
      {/* Main Panel */}
      <div className="card-base overflow-hidden">
        {/* Header */}
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-label mb-1">Yield Explorer</h1>
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary" />
                <h2 className="text-caption">Discover Best Yields</h2>
              </div>
            </div>

            {/* <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => setAmount(formatNumber(selectedToken.balance))}
                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="text-caption">Balance:</span>
                <span className="text-mono text-xs text-foreground">
                  {formatNumber(selectedToken.balance)}
                </span>
                <span className="text-caption max-w-[60px] truncate">
                  {selectedToken.symbol}
                </span>
              </button>
              <RiskMeter value={riskProfile} onChange={setRiskProfile} />
            </div> */}
          </div> 
        </div>

        <div className="flex items-center justify-end p-3 mb-1">

            
              <button
                onClick={() => setAmount(formatNumber(selectedToken.balance))}
                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="text-caption">Balance:</span>
                <span className="text-mono text-xs text-foreground">
                  {formatNumber(selectedToken.balance)}
                </span>
                <span className="text-caption max-w-[60px] truncate">
                  {selectedToken.symbol}
                </span>
              </button>
              <RiskMeter value={riskProfile} onChange={setRiskProfile} />
            
          </div>

        {/* Input Section */}
        <div className="card-body">
          {/* Quick Amount Row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-label">Deposit</span>
            <div className="flex items-center gap-1">
              {quickAmounts.map((pct, index) => {
                const isActive = getActiveQuickAmount(pct);
                return (
                  <button
                    key={pct}
                    onClick={() => handleQuickAmount(pct)}
                    className={cn(
                      "quick-btn",
                      isActive && "quick-btn-active",
                      index === 0 && "rounded-l-sm",
                      index === quickAmounts.length - 1 && "rounded-r-sm"
                    )}
                  >
                    {pct}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input + Token Selector */}
          <div className="input-wrapper flex items-center gap-2 rounded-md">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input-lg flex-1 min-w-0"
            />
            <TokenSelector
              tokens={tokens}
              selectedToken={selectedToken}
              onSelect={setSelectedToken}

            />
          </div>
        </div>
      </div>

      {/* Yield Routes */}
      {showRoutes && numericAmount > 0 && (
        <YieldRoutes
          token={selectedToken}
          amount={numericAmount}
          riskProfile={riskProfile}
        />
      )}
    </div>
  );
}
