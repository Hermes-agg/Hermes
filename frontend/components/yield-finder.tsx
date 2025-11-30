"use client"

import { Search, Sliders } from "lucide-react"
import { useState } from "react"

export function YieldFinder() {
  const [amount, setAmount] = useState("")
  const [riskTolerance, setRiskTolerance] = useState("medium")

  return (
    <section id="find-yield" className="py-12 md:py-20 px-4 md:px-6 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Find Your Yield Strategy</h2>

        {/* Search Card */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 md:p-8 shadow-xl">
          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground/70 mb-3">Amount to Invest</label>
            <div className="flex items-center gap-3 bg-background rounded-lg px-4 py-3 border border-border/30 focus-within:border-accent/50 transition">
              <span className="text-foreground/60">◎</span>
              <input
                type="number"
                placeholder="Enter SOL amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-foreground/40"
              />
            </div>
          </div>

          {/* Risk Tolerance */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground/70 mb-3">Risk Tolerance</label>
            <div className="grid grid-cols-3 gap-3">
              {["conservative", "medium", "aggressive"].map((risk) => (
                <button
                  key={risk}
                  onClick={() => setRiskTolerance(risk)}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition ${
                    riskTolerance === risk
                      ? "bg-accent text-accent-foreground"
                      : "bg-background border border-border/30 text-foreground/70 hover:border-border/50"
                  }`}
                >
                  {risk.charAt(0).toUpperCase() + risk.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition">
              <Search size={18} />
              Find Best Yield
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border/30 text-foreground hover:bg-muted transition">
              <Sliders size={18} />
              Advanced
            </button>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-center text-sm text-foreground/60 mt-6">
          We analyze real-time data from 150+ protocols to find you the best risk-adjusted yields
        </p>
      </div>
    </section>
  )
}
