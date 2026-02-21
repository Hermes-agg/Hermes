import Image from "next/image"
import { WaitlistForm } from "@/components/waitlist-form"

export default function WaitlistPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-6">
      <div className="w-full max-w-lg mx-auto text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/icon.svg"
            alt="Hermes"
            width={80}
            height={80}
            className="object-contain dark:invert"
            priority
          />
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Join the Hermes Waitlist
          </h1>
          <p className="text-body text-muted-foreground max-w-md mx-auto">
            Be among the first to access the best DeFi yield strategies on Solana.
            Simplified, optimized, yours.
          </p>
        </div>

        {/* Form card */}
        <div className="card-base p-6 sm:p-8 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm">
          <WaitlistForm />
        </div>

        {/* Trust line */}
        <p className="text-caption text-muted-foreground text-xs">
          No spam. Unsubscribe anytime. Your data stays private.
        </p>
      </div>
    </div>
  )
}
