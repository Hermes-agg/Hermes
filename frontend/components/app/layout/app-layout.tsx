"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { AppHeader } from "./app-header"
import { LoadingProvider, useLoading } from "./loading-context"

import WalletAdapterProvider from '@/components/app/providers/WalletAdapterProvider'
import { WalletProvider } from "../providers/WalletProvider"
import BackgroundDecor from "@/components/decor/BackgroundDecor"
import { cn } from "@/lib/utils"
import YieldLayout from "./yield-layout"

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

                {/* Background Grid */}
                <div className="pointer-events-none fixed inset-0 bg-grid opacity-[0.05]" />

                {/* Gradient Overlay */}
                {/* <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" /> */}

                {/* Main Content */}
                <div className="relative z-10">
                    <main
                        className={cn(
                            "mx-auto max-w-5xl px-4 py-6 md:py-10 transition-opacity duration-300",
                            isLoading ? "opacity-90" : "opacity-100"
                        )}
                    >{/* <BackgroundDecor /> */}
                        {children}
                    </main>
                </div>
            </div>
        </>
    )
}



export default function AppLayout({ children }: { children: React.ReactNode }) {

    const pathname = usePathname()

    const isYieldPage = pathname === "/" || pathname.startsWith("/yield")

    const LayoutType = isYieldPage ? YieldLayout : AppLayoutContent

    return (
        <WalletAdapterProvider>
            <WalletProvider>
                <LoadingProvider>
                    <LayoutType>
                        {children}
                    </LayoutType>
                </LoadingProvider>
            </WalletProvider>
        </WalletAdapterProvider>
    )
}




