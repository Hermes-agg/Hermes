import { FooterLogo } from "./footer-logo"

export function WaitlistFooter() {
  return (
    <footer className="w-full border-t border-border/50 mt-auto">
      <div className="mx-auto max-w-6xl flex items-center justify-between py-4 px-4">
        <div className="flex items-center gap-3">
          <FooterLogo />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">© 2026</span>
        </div>
        <div className="flex gap-2">
          <a href="mailto:hermesaggregator@gmail.com" className="size-8 flex items-center justify-center rounded border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors" aria-label="Email">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </a>
          <a href="https://x.com/Hermes_agg" target="_blank" rel="noopener noreferrer" className="size-8 flex items-center justify-center rounded border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors" aria-label="X">
            <svg fill="currentColor" height="14" viewBox="0 0 20 20" width="14"><path d="M15.27 1.59h2.81L11.94 8.6 19.17 18.16h-5.66l-4.07-5.79L1.2 18.16H6.63l3.04-6.88L.83 1.59h6.44l3.77 5.28L15.27 1.59zM14.29 16.48h1.56L5.79 3.18H4.12l10.17 13.3z" /></svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
