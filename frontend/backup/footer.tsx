export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background mt-12 md:mt-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition">
                  Find Yield
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition">
                  Strategies
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition">
                  Dashboard
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Learn</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition">
                  Guides
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Community</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition">
                  Disclaimer
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">Ⓗ</span>
            </div>
            <span className="font-semibold">Hermes</span>
          </div>
          <p className="text-sm text-foreground/60">© 2025 Hermes. All rights reserved. Not financial advice.</p>
        </div>
      </div>
    </footer>
  )
}
