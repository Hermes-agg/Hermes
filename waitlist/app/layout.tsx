import type React from "react"
import type { Metadata } from "next"
import { Outfit, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppShell } from "@/components/app-shell"

const outfit = Outfit({ subsets: ["latin"], variable: "--font-body" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Hermes Waitlist - Join the Future of Yield",
  description: "Join the Hermes waitlist. Be the first to access the best DeFi yield strategies on Solana.",
  icons: {
    icon: "/hermes-icon-light-32x32.png",
    shortcut: "/hermes-icon-light-32x32.png",
    apple: "/hermes-icon-light-32x32.png",
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
            <AppShell>{children}</AppShell>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
