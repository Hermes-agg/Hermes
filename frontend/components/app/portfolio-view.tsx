"use client"

import { useState } from "react"
import {
  TrendingUp,
  Wallet,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Clock,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const positions = [
  {
    id: 1,
    protocol: "Kamino",
    asset: "SOL",
    deposited: "5.2 SOL",
    value: 1040,
    apy: 12.4,
    earned: 24.5,
    change24h: 2.3,
    icon: "/solana-logo.png",
    status: "active",
  },
  {
    id: 2,
    protocol: "Solend",
    asset: "USDC",
    deposited: "500 USDC",
    value: 500,
    apy: 8.2,
    earned: 12.3,
    change24h: 0.1,
    icon: "/usdc-logo.png",
    status: "active",
  },
  {
    id: 3,
    protocol: "Marinade",
    asset: "SOL",
    deposited: "3.1 SOL",
    value: 620,
    apy: 7.8,
    earned: 8.2,
    change24h: -0.5,
    icon: "/solana-logo.png",
    status: "active",
  },
  {
    id: 4,
    protocol: "Drift",
    asset: "USDC",
    deposited: "250 USDC",
    value: 250,
    apy: 18.5,
    earned: 15.4,
    change24h: 5.2,
    icon: "/usdc-logo.png",
    status: "active",
  },
]

const transactions = [
  {
    id: 1,
    type: "deposit",
    protocol: "Kamino",
    asset: "SOL",
    amount: "2.0 SOL",
    time: "2 hours ago",
    txHash: "4xK2...8mNp",
  },
  {
    id: 2,
    type: "withdraw",
    protocol: "Solend",
    asset: "USDC",
    amount: "100 USDC",
    time: "1 day ago",
    txHash: "7yT5...2qRs",
  },
  {
    id: 3,
    type: "deposit",
    protocol: "Drift",
    asset: "USDC",
    amount: "250 USDC",
    time: "3 days ago",
    txHash: "9pL8...5wXz",
  },
  {
    id: 4,
    type: "claim",
    protocol: "Marinade",
    asset: "SOL",
    amount: "0.05 SOL",
    time: "5 days ago",
    txHash: "2aB9...7cDe",
  },
]

export function PortfolioView() {
  const [activeTab, setActiveTab] = useState<"positions" | "history">("positions")

  const totalValue = positions.reduce((sum, p) => sum + p.value, 0)
  const totalEarned = positions.reduce((sum, p) => sum + p.earned, 0)
  const avgApy = positions.reduce((sum, p) => sum + p.apy, 0) / positions.length

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Portfolio</h1>
          <p className="mt-1 text-muted-foreground">Track your yield positions across protocols</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/50 bg-card/80 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold text-foreground">${totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/80 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <p className="text-2xl font-bold text-emerald-400">${totalEarned.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/80 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. APY</p>
              <p className="text-2xl font-bold text-foreground">{avgApy.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/80 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground">
              <span className="text-lg font-bold">{positions.length}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Positions</p>
              <p className="text-2xl font-bold text-foreground">{positions.length} protocols</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 border-b border-border/50">
        <button
          onClick={() => setActiveTab("positions")}
          className={cn(
            "relative px-4 py-3 text-sm font-medium transition-colors",
            activeTab === "positions" ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Active Positions
          {activeTab === "positions" && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "relative px-4 py-3 text-sm font-medium transition-colors",
            activeTab === "history" ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Transaction History
          {activeTab === "history" && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
        </button>
      </div>

      {/* Positions list */}
      {activeTab === "positions" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {positions.map((pos) => (
            <div
              key={pos.id}
              className="group rounded-2xl border border-border/50 bg-card/80 p-5 backdrop-blur-sm transition-all hover:border-primary/30"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img src={pos.icon || "/placeholder.svg"} alt={pos.asset} className="h-10 w-10 rounded-full" />
                  <div>
                    <div className="font-semibold text-foreground">{pos.protocol}</div>
                    <div className="text-sm text-muted-foreground">{pos.deposited}</div>
                  </div>
                </div>
                <button className="rounded-lg p-2 text-muted-foreground opacity-0 transition-all hover:bg-secondary hover:text-foreground group-hover:opacity-100">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Value</p>
                  <p className="font-semibold text-foreground">${pos.value.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">APY</p>
                  <p className="font-semibold text-primary">{pos.apy}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Earned</p>
                  <p className="font-semibold text-emerald-400">${pos.earned.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    pos.change24h >= 0 ? "text-emerald-400" : "text-rose-400",
                  )}
                >
                  {pos.change24h >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(pos.change24h)}% (24h)
                </div>
                <Button size="sm" variant="outline">
                  Manage
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction history */}
      {activeTab === "history" && (
        <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="divide-y divide-border/50">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      tx.type === "deposit" && "bg-emerald-500/10 text-emerald-400",
                      tx.type === "withdraw" && "bg-rose-500/10 text-rose-400",
                      tx.type === "claim" && "bg-amber-500/10 text-amber-400",
                    )}
                  >
                    {tx.type === "deposit" && <ArrowDownRight className="h-5 w-5" />}
                    {tx.type === "withdraw" && <ArrowUpRight className="h-5 w-5" />}
                    {tx.type === "claim" && <TrendingUp className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-medium text-foreground capitalize">{tx.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {tx.protocol} - {tx.asset}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      "font-semibold",
                      tx.type === "deposit"
                        ? "text-emerald-400"
                        : tx.type === "withdraw"
                          ? "text-rose-400"
                          : "text-amber-400",
                    )}
                  >
                    {tx.type === "deposit" ? "+" : tx.type === "withdraw" ? "-" : "+"}
                    {tx.amount}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {tx.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {positions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 py-16 text-center">
          <Wallet className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">No positions yet</h3>
          <p className="mb-6 text-muted-foreground">Connect your wallet and start earning yield</p>
          <Button className="bg-primary text-primary-foreground">Find Best Yields</Button>
        </div>
      )}
    </div>
  )
}
