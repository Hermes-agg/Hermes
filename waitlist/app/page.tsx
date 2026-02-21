import { WaitlistForm } from "@/components/waitlist-form"
import {
  Zap,
  Shield,
  Route,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

export default function WaitlistPage() {
  return (
    <div className="relative">
      {/* Background grid from Hermes frontend */}
      <div className="fixed inset-0 -z-10 bg-grid opacity-[0.04] dark:opacity-[0.08]" />

      {/* Hero - form BESIDE content, not below */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-14">
          {/* Left: Copy */}
          <div className="flex-1 min-w-0 space-y-6">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">
              • Yield Intelligence for Solana
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              The news,
              <br />
              <span className="text-primary">with the yields.</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-xl">
              Real-time yield aggregation across every protocol on Solana. No tab switching. No digging through docs. Just the best risk-adjusted APY.
            </p>
            <a href="#waitlist" className="btn-primary inline-flex">
              Request Early Access →
            </a>
          </div>

          {/* Right: Waitlist form - SIDE BY SIDE */}
          <div
            id="waitlist"
            className="flex-shrink-0 w-full lg:w-[380px] rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-foreground mb-1">Join the waitlist</h3>
            <p className="text-sm text-muted-foreground mb-5">Be first to know when access opens.</p>
            <WaitlistForm />
            <p className="text-xs text-muted-foreground mt-4">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12">
            Deposit to route. One click.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Route className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Browse protocols</h3>
              <p className="text-sm text-muted-foreground">
                50–80 yield-bearing protocols exist on Solana. Hermes indexes them so you don&apos;t have to.
              </p>
            </div>
            <div className="space-y-4">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Spot the best APY</h3>
              <p className="text-sm text-muted-foreground">
                Our engine compares yield, risk, and fees. You see the optimal route — not 6% after slippage, the real number.
              </p>
            </div>
            <div className="space-y-4">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Click to deposit</h3>
              <p className="text-sm text-muted-foreground">
                One deposit. Hermes routes liquidity to the best protocol. Smart routing, zero legwork.
              </p>
            </div>
            <div className="space-y-4">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Track & rebalance</h3>
              <p className="text-sm text-muted-foreground">
                Dynamic portfolio orchestration. We handle risk scoring, validator delinquency, and volatility exposure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The problem & solution - condensed */}
      <section className="border-t border-border/50 py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">The problem</p>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                100+ protocols. 6% real APY.
              </h2>
              <p className="text-muted-foreground">
                DeFi is scattered — LSTs, lending, DEX LP, staking. Protocols show 10–20% APY, but after fees and slippage you get 6–14%. Plus the jargon, the docs, the videos. That&apos;s why the 99% stay out.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Our solution</p>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Hermes. Like Google Maps for yield.
              </h2>
              <p className="text-muted-foreground">
                We aggregate yield, risk, liquidity pathing, and execution. One meta layer. You click deposit — we route. The first yield intelligence layer for Solana. DeFi shouldn&apos;t be for a selected few.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Powered by Solana */}
      <section className="border-t border-border/50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">Natively built on</p>
          <h2 className="text-3xl font-bold text-foreground mb-4">Solana</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
            Hermes aggregates across Marinade, Jito, Kamino, Solend, Orca, Jupiter, and 10+ more. One routing engine. Best execution.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-mono text-muted-foreground">
            <span>Marinade</span>
            <span>Jito</span>
            <span>Kamino</span>
            <span>Solend</span>
            <span>Orca</span>
            <span>Jupiter</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/50 py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">FAQ</p>
          <h2 className="text-3xl font-bold text-foreground mb-10">Common questions</h2>
          <div className="space-y-4">
            <details className="group rounded-lg border border-border/50 bg-card p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-foreground">
                What is Hermes?
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-sm text-muted-foreground">
                Hermes is the first meta yield aggregator natively built on Solana. We aggregate yield across every protocol and present the best risk-adjusted option via our smart routing engine.
              </p>
            </details>
            <details className="group rounded-lg border border-border/50 bg-card p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-foreground">
                How does routing work?
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-sm text-muted-foreground">
                Our backend decides where your liquidity is most productive (yield), safest (risk scoring), instantly deployable (pathing), and gets the best execution (price aggregation). You deposit once — we handle the rest.
              </p>
            </details>
            <details className="group rounded-lg border border-border/50 bg-card p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-foreground">
                Is it safe?
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-sm text-muted-foreground">
                We index established, audited protocols. Our risk engine scores each route. No shady APYs — you see the real numbers before you deposit.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Read the news with the yields.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join the waitlist to be first when we launch.
          </p>
          <a href="#waitlist" className="btn-primary inline-flex">
            Join the waitlist →
          </a>
        </div>
      </section>
    </div>
  )
}
