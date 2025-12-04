"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { AppHeader } from "./app-header"
import { LoadingProvider, useLoading } from "./loading-context"

import WalletAdapterProvider from '@/components/app/providers/WalletAdapterProvider'
import { WalletProvider } from "../providers/WalletProvider"
import BackgroundDecor from "@/components/decor/BackgroundDecor"

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
            <AppHeader isLoading={isLoading} />
            <div className="relative min-h-screen transition-colors duration-300">
                <div className="pointer-events-none fixed inset-0 bg-grid opacity-30" />
                <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/20" />

                <div className="relative z-10">
                    <main className={`mx-auto max-w-5xl px-4 pb-6 pt-4 transition-opacity duration-300 ${
                        isLoading ? 'opacity-50' : 'opacity-100'
                    }`}>
                        {/* <BackgroundDecor /> */}
                        {children}
                    </main>
                </div>
            </div>
        </>
    )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <WalletAdapterProvider>
            <WalletProvider>
                <LoadingProvider>
                    <AppLayoutContent>
                        {children}
                    </AppLayoutContent>
                </LoadingProvider>
            </WalletProvider>
        </WalletAdapterProvider>
    )
}
