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



function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const { isLoading, setIsLoading } = useLoading()
    const pathname = usePathname()

    // Show loading on initial mount
    useEffect(() => {
        setIsLoading(true)
        const timer = setTimeout(() => setIsLoading(false), 800)
        return () => clearTimeout(timer)
    }, [setIsLoading])

    // Show loading when route changes
    useEffect(() => {
        setIsLoading(true)
        const timer = setTimeout(() => setIsLoading(false), 600)
        return () => clearTimeout(timer)
    }, [pathname, setIsLoading])

    return (
        <>
            <div className="min-h-screen bg-background">
                <AppHeader isLoading={isLoading} />

                {/* Main Content */}
                <div className="relative z-10">
                    <main
                        className={cn(
                            "mx-2 md:mx-auto max-w-7xl py-6 md:py-10 transition-opacity duration-300",
                            isLoading ? "opacity-50" : "opacity-100",
                        )}
                    >
                        {/* <BackgroundDecor /> */}
                        {children}
                    </main>
                </div>
            </div>
        </>
    )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const isYieldPage = pathname === "/" || pathname.startsWith("/yields")

    const LayoutType = isYieldPage ? YieldLayout : AppLayoutContent

    return (
        <>
            <CursorSpotlight />
            <WalletAdapterProvider>
                <WalletProvider>
                    <LoadingProvider>

                        <LayoutType>{children}</LayoutType>

                    </LoadingProvider>
                </WalletProvider>
            </WalletAdapterProvider>
        </>
    )
}
