import { AppHeader } from "@/components/app/app-header"
import { PortfolioView } from "@/components/app/portfolio-view"

export default function PortfolioPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-30" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="relative z-10">
        <AppHeader />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <PortfolioView />
        </main>
      </div>
    </div>
  )
}
