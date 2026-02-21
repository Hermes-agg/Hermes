"use client"

import { usePathname } from "next/navigation"
import { WaitlistHeader } from "./waitlist-header"
import { WaitlistFooter } from "./waitlist-footer"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <WaitlistHeader />
      <main className="flex-1 relative">{children}</main>
      <WaitlistFooter />
    </>
  )
}
