"use client"

import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-lg">Ⓗ</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
            Hermes
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#find-yield" className="text-sm text-foreground/70 hover:text-foreground transition">
            Find Yield
          </a>
          <a href="#strategies" className="text-sm text-foreground/70 hover:text-foreground transition">
            Strategies
          </a>
          <a href="#features" className="text-sm text-foreground/70 hover:text-foreground transition">
            Features
          </a>
          <a href="#about" className="text-sm text-foreground/70 hover:text-foreground transition">
            About
          </a>
        </nav>

        {/* CTA & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button className="hidden md:px-6 md:py-2 md:rounded-full md:bg-accent md:text-accent-foreground md:text-sm md:font-medium md:hover:bg-accent/90 md:transition md:inline-block">
            Connect Wallet
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 hover:bg-muted rounded-lg transition">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="px-4 py-4 space-y-3">
            <a href="#find-yield" className="block text-sm text-foreground/70 hover:text-foreground py-2">
              Find Yield
            </a>
            <a href="#strategies" className="block text-sm text-foreground/70 hover:text-foreground py-2">
              Strategies
            </a>
            <a href="#features" className="block text-sm text-foreground/70 hover:text-foreground py-2">
              Features
            </a>
            <a href="#about" className="block text-sm text-foreground/70 hover:text-foreground py-2">
              About
            </a>
            <button className="w-full mt-4 px-6 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition">
              Connect Wallet
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
