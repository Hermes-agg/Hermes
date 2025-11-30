"use client"

import { useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Users,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const protocolStats = [
  { name: "Kamino", tvl: "$245M", apy: "8.5%", change: 12.4, users: "12.5k", volume24h: "$18.2M" },
  { name: "Marinade", tvl: "$580M", apy: "7.2%", change: 5.2, users: "45.2k", volume24h: "$32.1M" },
  { name: "Solend", tvl: "$156M", apy: "9.8%", change: -3.1, users: "8.3k", volume24h: "$12.5M" },
  { name: "Drift", tvl: "$124M", apy: "18.2%", change: 8.7, users: "3.8k", volume24h: "$45.8M" },
  { name: "Meteora", tvl: "$78M", apy: "28.5%", change: 15.3, users: "2.4k", volume24h: "$28.3M" },
  { name: "Raydium", tvl: "$312M", apy: "22.1%", change: -1.8, users: "18.9k", volume24h: "$89.2M" },
]

const marketOverview = [
  { label: "Total Value Locked", value: "$1.49B", change: 8.2, icon: DollarSign },
  { label: "24h Volume", value: "$226M", change: 12.5, icon: Activity },
  { label: "Active Users", value: "91.1k", change: 5.8, icon: Users },
  { label: "Avg. APY", value: "15.7%", change: -2.1, icon: Percent },
]

const yieldTrends = [
  { period: "1D", sol: 8.5, usdc: 6.2, usdt: 5.8 },
  { period: "7D", sol: 9.1, usdc: 6.8, usdt: 6.1 },
  { period: "30D", sol: 10.2, usdc: 7.5, usdt: 6.9 },
  { period: "90D", sol: 11.8, usdc: 8.2, usdt: 7.4 },
]

export function AnalyticsView() {
  const [timeframe, setTimeframe] = useState("7D")

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Analytics</h1>
          <p className="mt-1 text-muted-foreground">Solana DeFi yield market overview</p>
        </div>
        <div className="flex gap-2">
          {["1D", "7D", "30D", "90D"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                timeframe === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Market overview cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {marketOverview.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-2xl border border-border/50 bg-card/80 p-5 backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                    stat.change >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400",
                  )}
                >
                  {stat.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Yield trends */}
      <div className="rounded-2xl border border-border/50 bg-card/80 p-5 backdrop-blur-sm sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Yield Trends</h2>
            <p className="text-sm text-muted-foreground">Average APY by asset over time</p>
          </div>
        </div>

        {/* Simple bar chart representation */}
        <div className="space-y-6">
          {yieldTrends.map((trend) => (
            <div
              key={trend.period}
              className={cn(
                "rounded-xl border p-4 transition-all",
                timeframe === trend.period ? "border-primary/30 bg-primary/5" : "border-border/50 bg-secondary/30",
              )}
            >
              <div className="mb-3 text-sm font-medium text-muted-foreground">{trend.period} Average</div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <span className="text-sm text-foreground">SOL</span>
                  <span className="font-semibold text-primary">{trend.sol}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <span className="text-sm text-foreground">USDC</span>
                  <span className="font-semibold text-primary">{trend.usdc}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <span className="text-sm text-foreground">USDT</span>
                  <span className="font-semibold text-primary">{trend.usdt}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Protocol leaderboard */}
      <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="border-b border-border/50 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Protocol Leaderboard</h2>
              <p className="text-sm text-muted-foreground">Top performing protocols by TVL</p>
            </div>
          </div>
        </div>

        {/* Table header - desktop */}
        <div className="hidden border-b border-border/50 px-5 py-3 sm:px-6 lg:grid lg:grid-cols-6">
          <span className="text-sm font-medium text-muted-foreground">Protocol</span>
          <span className="text-sm font-medium text-muted-foreground">TVL</span>
          <span className="text-sm font-medium text-muted-foreground">Avg APY</span>
          <span className="text-sm font-medium text-muted-foreground">24h Change</span>
          <span className="text-sm font-medium text-muted-foreground">Users</span>
          <span className="text-sm font-medium text-muted-foreground">24h Volume</span>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-border/50">
          {protocolStats.map((protocol, index) => (
            <div key={protocol.name} className="p-4 transition-all hover:bg-secondary/30 sm:p-5">
              {/* Mobile layout */}
              <div className="flex flex-col gap-3 lg:hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-sm font-bold text-foreground">
                      {index + 1}
                    </div>
                    <span className="font-semibold text-foreground">{protocol.name}</span>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      protocol.change >= 0 ? "text-emerald-400" : "text-rose-400",
                    )}
                  >
                    {protocol.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(protocol.change)}%
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">TVL: </span>
                    <span className="font-medium text-foreground">{protocol.tvl}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">APY: </span>
                    <span className="font-medium text-primary">{protocol.apy}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Users: </span>
                    <span className="font-medium text-foreground">{protocol.users}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Volume: </span>
                    <span className="font-medium text-foreground">{protocol.volume24h}</span>
                  </div>
                </div>
              </div>

              {/* Desktop layout */}
              <div className="hidden lg:grid lg:grid-cols-6 lg:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-foreground">
                    {index + 1}
                  </div>
                  <span className="font-semibold text-foreground">{protocol.name}</span>
                </div>
                <span className="font-medium text-foreground">{protocol.tvl}</span>
                <span className="font-medium text-primary">{protocol.apy}</span>
                <div
                  className={cn(
                    "flex items-center gap-1 font-medium",
                    protocol.change >= 0 ? "text-emerald-400" : "text-rose-400",
                  )}
                >
                  {protocol.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {Math.abs(protocol.change)}%
                </div>
                <span className="text-foreground">{protocol.users}</span>
                <span className="text-foreground">{protocol.volume24h}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
