import { WaitlistForm } from "@/components/waitlist-form"
import { ScrollArrow } from "@/components/scroll-arrow"
import { FaqAccordion } from "@/components/faq-accordion"
import { ProtocolMarquee } from "@/components/protocol-marquee"
import { Zap, Shield, Route, BarChart3 } from "lucide-react"

export default function WaitlistPage() {
  return (
    <div className="relative overflow-x-hidden">
      {/* Background: grid + rich hero overlay */}
      <div className="fixed inset-0 -z-10 bg-grid opacity-[0.04] dark:opacity-[0.08]" />
      <div
        className="fixed inset-0 -z-10 opacity-[0.5] dark:opacity-[0.3]"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, var(--primary) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 100% 50%, var(--primary) 0%, transparent 40%),
            radial-gradient(ellipse 60% 40% at 0% 80%, var(--primary) 0%, transparent 40%)
          `,
        }}
      />
      <div
        className="fixed inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Hero - form BESIDE content, not below */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-20">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8 sm:gap-10 lg:gap-14">
          {/* Left: Copy */}
          <div className="flex-1 min-w-0 space-y-5 sm:space-y-6">
            <p className="text-xs sm:text-sm font-medium text-primary uppercase tracking-wider inline-flex items-center gap-2">
              <span
                className="size-2 rounded-full bg-[oklch(0.58_0.14_142)] shrink-0"
                style={{ animation: "status-blink 1.5s ease-in-out infinite" }}
                aria-hidden
              />
              Yield Intelligence for Solana
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
              One Click,
              <br />
              <span className="text-primary">Discover Yield <br className="hidden sm:block" /> You Can Trust</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
              Real-time yield aggregation across every protocol on Solana. No tab switching. No digging through docs. Just the best risk-adjusted APY.
            </p>
            <a href="#waitlist" className="btn-primary inline-flex">
              Request Early Access →
            </a>
          </div>

          {/* Right: Waitlist form - SIDE BY SIDE */}
          <div
            id="waitlist"
            className="flex-shrink-0 w-full min-w-0 lg:w-[380px] rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm p-4 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-primary/20"
          >
            <h3 className="text-lg font-semibold text-foreground mb-1">Join the waitlist</h3>
            <p className="text-sm text-muted-foreground mb-5">Be first to know when access opens.</p>
            <WaitlistForm />
            <p className="text-xs text-muted-foreground mt-4">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/50 py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs sm:text-sm font-medium text-primary uppercase tracking-wider mb-2">How it works</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-8 sm:mb-12">
            Deposit to route. One click.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-4 rounded-xl p-4 transition-all duration-300 hover:bg-muted/30">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center transition-colors duration-300">
                <Route className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Browse protocols</h3>
              <p className="text-sm text-muted-foreground">
                50–80 yield-bearing protocols exist on Solana. Hermes indexes them so you don&apos;t have to.
              </p>
            </div>
            <div className="space-y-4 rounded-xl p-4 transition-all duration-300 hover:bg-muted/30">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center transition-colors duration-300">
                <BarChart3 className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Spot the best APY</h3>
              <p className="text-sm text-muted-foreground">
                Our engine compares yield, risk, and fees. You see the optimal route — not 6% after slippage, the real number.
              </p>
            </div>
            <div className="space-y-4 rounded-xl p-4 transition-all duration-300 hover:bg-muted/30">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center transition-colors duration-300">
                <Zap className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Click to deposit</h3>
              <p className="text-sm text-muted-foreground">
                One deposit. Hermes routes liquidity to the best protocol. Smart routing, zero legwork.
              </p>
            </div>
            <div className="space-y-4 rounded-xl p-4 transition-all duration-300 hover:bg-muted/30">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center transition-colors duration-300">
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
      <section className="border-t border-border/50 py-12 sm:py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">The problem</p>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                100+ protocols. 6% real APY.
              </h2>
              <p className="text-muted-foreground">
                DeFi is scattered — LSTs, lending, DEX LP, staking. Protocols show 10–20% APY, but after fees and slippage you get 6–14%. Plus the jargon, the docs, the videos. That&apos;s why the 99% stay out.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Our solution</p>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                Hermes. Like Google Maps for yield.
              </h2>
              <p className="text-muted-foreground">
                We aggregate yield, risk, liquidity pathing, and execution. One meta layer. You click deposit — we route. The first yield intelligence layer for Solana. DeFi shouldn&apos;t be for a selected few.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Powered by Solana - protocol logos marquee */}
      <section className="border-t border-border/50 py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ProtocolMarquee />
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/50 py-12 sm:py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">FAQ</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-10">Common questions</h2>
          <FaqAccordion />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
            Read the news with the yields.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join the waitlist to be first when we launch.
          </p>
          <a href="#waitlist" className="btn-primary inline-flex transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
            Join the waitlist →
          </a>
        </div>
      </section>

      <ScrollArrow />
    </div>
  )
}
