"use client"

// import { useTabScroll } from "@/hooks/useTabScroll"
import { AppHeader } from "./app-header"
import { usePathname } from "next/navigation"


export default function YieldLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // useTabScroll(pathname, "#tab-content")

  return (
    <div className="min-h-screen bg-background">
      <AppHeader isLoading={false} />

      <main id="tab-content" className="w-full p-0">
        {children}
      </main>
    </div>
  )
}
