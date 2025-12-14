"use client"

import type React from "react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { AppHeader } from "./app-header"
import { LoadingProvider, useLoading } from "./loading-context"

import WalletAdapterProvider from "@/components/app/providers/WalletAdapterProvider"
import { WalletProvider } from "../providers/WalletProvider"

import { cn } from "@/lib/utils"
import YieldLayout from "./yield-layout"
import { CursorSpotlight } from "./decor/cursor-spotlight"
import { AppFooter } from "./app-footer"


function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const { isLoading, setIsLoading } = useLoading()
    const pathname = usePathname()

    useEffect(() => {
        setIsLoading(true)
        const timer = setTimeout(() => setIsLoading(false), 800)
        return () => clearTimeout(timer)
    }, [setIsLoading])

    useEffect(() => {
        setIsLoading(true)
        const timer = setTimeout(() => setIsLoading(false), 600)
        return () => clearTimeout(timer)
    }, [pathname, setIsLoading])

    return (
        <div className="min-h-screen bg-background relative"> {/* relative for positioning */}
            <CursorSpotlight>

                <AppHeader isLoading={isLoading} />

                {/* Main Content Wrapper - where the magic happens */}
                <div className="relative z-10">
                    <main
                        className={cn(
                            "mx-3 md:mx-auto max-w-7xl py-6 md:py-10 transition-opacity duration-300",
                            isLoading ? "opacity-50" : "opacity-100"
                        )}
                    >
                        {/* NOW the spotlight + grid is ONLY inside main */}
                        {children}

                    </main>
                </div>
                <AppFooter />
            </CursorSpotlight>
        </div>
    )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isYieldPage = pathname === "/" || pathname.startsWith("/yields")
    const LayoutType = isYieldPage ? YieldLayout : AppLayoutContent

    return (
        <WalletAdapterProvider>
            <WalletProvider>
                <LoadingProvider>
                    <LayoutType>{children}</LayoutType>
                </LoadingProvider>
            </WalletProvider>
        </WalletAdapterProvider>
    )
}