"use client"

import { useState } from "react"
import { ChevronDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Token {
  symbol: string
  name: string
  icon: string
  balance: string
}

interface TokenSelectorProps {
  tokens: Token[]
  selectedToken: Token
  onSelect: (token: Token) => void
}

export function TokenSelector({ tokens, selectedToken, onSelect }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/80 px-3 py-2.5 transition-all hover:border-primary/30 hover:bg-secondary"
      >
        <img
          src={selectedToken.icon || "/placeholder.svg"}
          alt={selectedToken.symbol}
          className="h-6 w-6 rounded-full"
        />
        <span className="font-semibold text-foreground">{selectedToken.symbol}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/50 bg-card p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Select Token</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tokens..."
                className="w-full rounded-xl border border-border/50 bg-secondary py-3 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
              />
            </div>

            {/* Token list */}
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {filteredTokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => {
                    onSelect(token)
                    setIsOpen(false)
                    setSearch("")
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl p-3 transition-all",
                    token.symbol === selectedToken.symbol
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-secondary border border-transparent",
                  )}
                >
                  <img src={token.icon || "/placeholder.svg"} alt={token.symbol} className="h-9 w-9 rounded-full" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-foreground">{token.symbol}</div>
                    <div className="text-xs text-muted-foreground">{token.name}</div>
                  </div>
                  <div className="text-right text-sm font-medium text-muted-foreground">{token.balance}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
