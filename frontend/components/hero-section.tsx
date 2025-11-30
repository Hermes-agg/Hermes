import { ChevronRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="pt-32 pb-12 md:pb-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/30">
          <span className="text-xs md:text-sm font-medium text-accent">✨ Optimize Your Yield</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-balance">
          Your{" "}
          <span className="bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">Best Route</span> to
          DeFi Yield
        </h1>

        <p className="text-lg md:text-xl text-foreground/70 mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
          Stop exploring hundreds of protocols. Hermes finds the highest yield opportunities across Solana in seconds—
          <span className="text-foreground">simplified, optimized, yours.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto px-8 py-3 rounded-full bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition">
            Start Exploring
          </button>
          <button className="w-full sm:w-auto px-8 py-3 rounded-full border border-border/50 text-foreground hover:bg-muted transition flex items-center justify-center gap-2">
            Watch Demo <ChevronRight size={16} />
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 md:mt-20 grid grid-cols-3 gap-4 md:gap-8">
          <div>
            <div className="text-2xl md:text-3xl font-bold text-accent">150+</div>
            <div className="text-xs md:text-sm text-foreground/60 mt-1">Protocols Indexed</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-accent">10-25%</div>
            <div className="text-xs md:text-sm text-foreground/60 mt-1">Average APY</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-accent">&lt;30s</div>
            <div className="text-xs md:text-sm text-foreground/60 mt-1">Find Best Yield</div>
          </div>
        </div>
      </div>
    </section>
  )
}
