import { AppHeader } from "@/components/app/app-header"
import { AnalyticsView } from "@/components/app/analytics-view"

export default function AnalyticsPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-30" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="relative z-10">
        <AppHeader />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <AnalyticsView />
        </main>
      </div>
    </div>
  )
}
