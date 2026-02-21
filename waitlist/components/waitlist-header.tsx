"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function WaitlistHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled &&
            "bg-gradient-to-br from-background/60 to-background/50 backdrop-blur-md supports-[backdrop-filter]:bg-background/40 border-b border-border/50"
        )}
      >
        <div className="mx-auto flex h-12 md:h-14 items-center justify-between px-2.5 pb-1 md:px-4">
          <div className="flex items-center gap-1 md:gap-8">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center text-foreground transition-all md:hidden h-7 w-7 group"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <div className="flex flex-col items-end gap-1">
                  <span className="w-4 h-[2px] bg-primary" />
                  <span className="w-2 h-[2px] bg-primary" />
                  <span className="w-3 h-[2px] bg-primary" />
                </div>
              ) : (
                <div className="flex flex-col items-start gap-1">
                  <span className="w-4 h-[2px] bg-muted-foreground group-hover:bg-primary" />
                  <span className="w-2 h-[2px] bg-muted-foreground group-hover:bg-primary" />
                  <span className="w-3 h-[2px] bg-muted-foreground group-hover:bg-primary" />
                </div>
              )}
            </button>

            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/icon.svg"
                alt="Hermes Logo"
                width={96}
                height={40}
                className="object-contain h-8 md:h-10 w-auto dark:invert"
                priority
              />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <span className="px-4 py-2 text-nav text-primary">Waitlist</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile backdrop */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all duration-300 md:hidden",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border/50 shadow-2xl",
          "transform transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border/50 px-4">
          <span className="font-mono text-sm font-bold uppercase tracking-wider">Menu</span>
        </div>
        <nav className="flex flex-col p-4 gap-1">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="nav-link text-left text-nav text-primary py-4 px-4"
          >
            Waitlist
          </Link>
          <a
            href="https://hermes.gg"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="text-muted-foreground hover:text-foreground py-4 px-4 font-mono text-xs uppercase tracking-wider transition-colors"
          >
            Main App
          </a>
        </nav>
      </div>
    </>
  );
}
