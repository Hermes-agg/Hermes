"use client"

import Image from "next/image"
import { ChevronDown, Check, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"
import { useEffect, useState } from "react"

export interface Token {
  symbol: string
  name: string
  icon: string
  balance: number
}

interface TokenSelectorProps {
  tokens: Token[]
  selectedToken: Token
  onSelect: (token: Token) => void
}

function TokenIcon({ token, size = "md" }: { token: Token; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }
  const px = size === "sm" ? 20 : size === "md" ? 24 : 32
  const [imgError, setImgError] = useState(false)

  return (
    <div className={cn("relative rounded-full overflow-hidden bg-muted flex items-center justify-center", sizeClasses[size])}>
      {!imgError ? (
        <Image
          src={token.icon}
          alt={token.symbol}
          width={px}
          height={px}
          className="object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-muted-foreground">
          {token.symbol.charAt(0)}
        </span>
      )}
    </div>
  )
}

export function TokenSelector({ tokens, selectedToken, onSelect }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative">
      {/* Trigger button - blends with card */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-2.5 py-1.5",
          "bg-transparent hover:bg-secondary/50 transition-all",
          "font-mono text-sm font-medium",
          "border border-transparent hover:border-border/30",
          isOpen && "bg-secondary/50 border-border/30"
        )}
      >
        <TokenIcon token={selectedToken} size="sm" />
        <span className="text-foreground">{selectedToken.symbol}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Modal via portal */}
      {isOpen && mounted &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 border border-border/50 bg-card p-5 shadow-2xl">
              {/* Sharp corner accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />

              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                  Select Token
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
                  className="w-full border border-border/50 bg-secondary py-2.5 pl-10 pr-4 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
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
                      "relative w-full flex items-center gap-3 p-3 transition-all",
                      token.symbol === selectedToken.symbol
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-secondary border border-transparent"
                    )}
                  >
                    {token.symbol === selectedToken.symbol && (
                      <>
                        <div className="absolute top-0 left-0 w-1 h-1 border-t-2 border-l-2 border-primary" />
                        <div className="absolute top-0 right-0 w-1 h-1 border-t-2 border-r-2 border-primary" />
                        <div className="absolute bottom-0 left-0 w-1 h-1 border-b-2 border-l-2 border-primary" />
                        <div className="absolute bottom-0 right-0 w-1 h-1 border-b-2 border-r-2 border-primary" />
                      </>
                    )}
                    <TokenIcon token={token} size="lg" />
                    <div className="flex-1 text-left">
                      <div className="font-mono text-sm font-medium text-foreground">{token.symbol}</div>
                      <div className="text-xs text-muted-foreground">{token.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-medium text-muted-foreground">{token.balance}</div>
                    </div>
                    {token.symbol === selectedToken.symbol && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  )
}
