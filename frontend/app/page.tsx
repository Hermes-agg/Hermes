'use client';

import { MarketAnalytics } from "@/components/app/MarketAnalytics";
import { YieldPanel } from "@/components/app/yield-panel";
import Image from "next/image";
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Hermes - Solana Yield Aggregator | Best DeFi Yields & APYs on Solana</title>
        <meta name="description" content="Hermes is the leading yield aggregator on Solana. Deposit your SOL, LSTs, or stablecoins into smart vaults that automatically optimize for the highest real-time APYs across top DeFi protocols." />
        <meta name="keywords" content="hermes solana, solana yield aggregator, best solana yields, solana defi apy, solana yield farming, solana auto compounding, solana vaults, highest solana apy" />
        <meta property="og:title" content="Hermes: Solana Yield Aggregator - Earn the Highest DeFi Yields Automatically" />
        <meta property="og:description" content="Like Yearn on Ethereum, Hermes auto-optimizes your deposits across Solana protocols for maximum yields on staking, lending, and farming." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/" /> {/* Replace with your actual domain */}
        <meta property="og:image" content="https://yourdomain.com/og-image-hermes-aggregator.jpg" /> {/* OG image with vault/yield theme */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://yourdomain.com/" /> {/* Replace with your actual URL */}
      </Head>

      <div className="mx-auto max-w-7xl transition-opacity duration-300 flex flex-col items-center justify-start w-full flex-1 h-full mt-0 md:pt-[10vh]">

        {/* Main Yield Panel - Users see vaults/opportunities first */}
        <div className="w-full flex-1 flex flex-col pb-6 px-3 min-sm:px-1 md:px-8 3xl:px-20">
          <YieldPanel />
        </div>

        {/* Powerful H1 and Description */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Earn the Highest Yields on Solana Automatically with Hermes
            </h1>
            <p className="mt-1 text-muted-foreground">
              Hermes is a powerful yield aggregator built exclusively for Solana DeFi. Deposit once into auto-optimizing vaults — we handle the rest, shifting your funds to the best lending, staking, and farming opportunities for maximum APY.
            </p>
          </div>
        </section>

        {/* Concise FAQ Section - Updated for aggregator reality */}
        <section className="w-full py-16 px-3 min-sm:px-1 md:px-8 3xl:px-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-8">
              <div className="border-b pb-8">
                <h3 className="text-xl font-semibold mb-3">What is Hermes?</h3>
                <p className="text-muted-foreground">Hermes is a yield aggregator on Solana — think Yearn Finance but optimized for Solana's speed and low fees. It automatically maximizes your returns by deploying deposits into the best DeFi strategies.</p>
              </div>
              <div className="border-b pb-8">
                <h3 className="text-xl font-semibold mb-3">How does yield aggregation work?</h3>
                <p className="text-muted-foreground">You deposit assets into Hermes vaults. Smart contracts then auto-compound and rebalance across top protocols (like Kamino, Marginfi, Jito) to chase the highest real-time APYs.</p>
              </div>
              <div className="border-b pb-8">
                <h3 className="text-xl font-semibold mb-3">Is my money safe?</h3>
                <p className="text-muted-foreground">Hermes is non-custodial — you always control your funds via your wallet. Vaults are audited, but DeFi carries risks like smart contract bugs. DYOR and start small.</p>
              </div>
              <div className="border-b pb-8">
                <h3 className="text-xl font-semibold mb-3">What assets and strategies are supported?</h3>
                <p className="text-muted-foreground">SOL, jitoSOL, mSOL, stablecoins (USDC, USDT), and more. Strategies include lending, liquid staking, leveraged loops, and liquidity provision.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Why choose Hermes on Solana?</h3>
                <p className="text-muted-foreground">Solana's fast, cheap transactions enable frequent rebalancing and compounding — delivering higher net yields than on other chains.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
