'use client'; // ← THIS IS CRITICAL

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CustomConnectButton } from "../connect/CustomConnectButton";
import { ThemeToggle } from "../ThemeToggle";
import { useTheme } from "next-themes";

interface AppHeaderProps {
  isLoading?: boolean;
}

export function AppHeader({ isLoading = false }: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // This runs only on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: "Yield", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Analytics", href: "/analytics" },
  ];

  // This will now update instantly when theme changes
  const logoSrc = mounted
    ? resolvedTheme === "dark"
      ? "/hermes-dark-logo.png"
      : "/hermes-logo.png"
    : "/hermes-logo.png"; // fallback during SSR

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4 md:gap-8">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center text-foreground transition-all md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" strokeWidth={2.5} />
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="w-5 h-[2px] bg-foreground" />
                  <span className="w-4 h-[2px] bg-foreground" />
                  <span className="w-3 h-[2px] bg-foreground" />
                </div>
              )}
            </button>

            {/* LOGO - NOW UPDATES INSTANTLY */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={logoSrc}
                alt="Hermes"
                width={96}
                height={40}
                className="object-contain h-full w-auto"
                priority
              />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "relative px-3 py-1.5 text-nav transition-all group rounded-sm",
                      active
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden md:flex" />
            <CustomConnectButton />
          </div>
        </div>

        <div className="relative h-[2px] w-full overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 bg-border/20">
              <div className="absolute h-full w-8 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
            </div>
          ) : (
            <div className="h-[2px] bg-border/20" />
          )}
        </div>
      </header>

      {/* Overlay & Mobile Menu */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          "fixed inset-0 z-80 bg-background/80 backdrop-blur-sm transition-all duration-300 md:hidden",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-99 w-72 bg-card border-r border-border/50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border/50 px-4">
          <span className="text-nav">Menu</span>
          <ThemeToggle />
        </div>
        <nav className="flex flex-col p-4 gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "relative px-4 py-3 text-nav transition-all rounded-sm",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {active && (
                  <>
                    <div className="absolute top-0 left-0 w-1 h-1 border-t-2 border-l-2 border-primary" />
                    <div className="absolute top-0 right-0 w-1 h-1 border-t-2 border-r-2 border-primary" />
                    <div className="absolute bottom-0 left-0 w-1 h-1 border-b-2 border-l-2 border-primary" />
                    <div className="absolute bottom-0 right-0 w-1 h-1 border-b-2 border-r-2 border-primary" />
                  </>
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}