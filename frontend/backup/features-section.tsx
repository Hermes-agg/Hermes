import { Zap, Brain, Lock, BarChart3 } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "Smart Recommendations",
      description: "AI-powered strategies tailored to your risk profile and capital amount",
    },
    {
      icon: Zap,
      title: "Real-Time Optimization",
      description: "Our algorithms constantly monitor yields and rebalance automatically",
    },
    {
      icon: Lock,
      title: "Risk Management",
      description: "Reduce exposure by diversifying across multiple protocols automatically",
    },
    {
      icon: BarChart3,
      title: "Clear Analytics",
      description: "Transparent tracking of your yield, fees, and actual returns",
    },
  ]

  return (
    <section id="features" className="py-12 md:py-20 px-4 md:px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Hermes</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Simplifying DeFi for everyone—from emerging investors to experienced yield farmers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/10">
                    <Icon size={24} className="text-accent" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-foreground/60">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
