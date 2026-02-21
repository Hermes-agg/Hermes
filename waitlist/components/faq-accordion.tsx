"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const ITEMS = [
  {
    q: "What is Hermes?",
    a: "Hermes is the first meta yield aggregator natively built on Solana. We aggregate yield across every protocol and present the best risk-adjusted option via our smart routing engine.",
  },
  {
    q: "How does routing work?",
    a: "Our backend decides where your liquidity is most productive (yield), safest (risk scoring), instantly deployable (pathing), and gets the best execution (price aggregation). You deposit once — we handle the rest.",
  },
  {
    q: "Is it safe?",
    a: "We index established, audited protocols. Our risk engine scores each route. No shady APYs — you see the real numbers before you deposit.",
  },
]

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      {ITEMS.map((item, i) => (
        <div
          key={i}
          className="rounded-lg border border-border/50 bg-card overflow-hidden transition-all duration-300 ease-out"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full cursor-pointer list-none items-center justify-between p-4 text-left font-medium text-foreground transition-colors hover:bg-muted/30"
          >
            {item.q}
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out",
                open === i && "rotate-180"
              )}
            />
          </button>
          <div
            className="grid transition-all duration-300 ease-out"
            style={{
              gridTemplateRows: open === i ? "1fr" : "0fr",
            }}
          >
            <div className="overflow-hidden">
              <p className="px-4 pb-4 text-sm text-muted-foreground">{item.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
