import { AppHeader } from "@/components/app/app-header"
import { YieldPanel } from "@/components/app/yield-panel"

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Background grid effect */}
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-30" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="relative z-10">
        <AppHeader />
        <main className="mx-auto max-w-2xl px-4 py-8">
          
          <YieldPanel />
        </main>
      </div>
    </div>
  )
}
