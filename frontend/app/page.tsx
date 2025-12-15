'use client';

import { MarketAnalytics } from "@/components/app/MarketAnalytics";
import { YieldPanel } from "@/components/app/yield-panel";
import Image from "next/image";
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Solana Yield Opportunities - Best SOL DeFi Yields & APY Explorer</title>
        <meta name="description" content="Discover the best yield opportunities on Solana. Explore real-time aggregated APYs across top Solana DeFi protocols, lending markets, staking, and yield farming strategies." />
        <meta name="keywords" content="solana yield opportunities, solana defi yields, solana apy, solana yield farming, solana staking yields, solana lending rates, best solana yields" />
        <meta property="og:title" content="Solana Yield Opportunities - Best SOL DeFi Yields & APY Explorer" />
        <meta property="og:description" content="Fully focused on Solana: Track the highest yield opportunities with real-time APYs, on-chain signals, and top DeFi protocols on the Solana blockchain." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/" /> {/* Replace with your actual domain */}
        <meta property="og:image" content="https://yourdomain.com/og-image-solana.jpg" /> {/* Recommended: Create an OG image featuring Solana branding */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://yourdomain.com/" /> {/* Replace with your actual URL */}
      </Head>

      <div className="mx-auto max-w-7xl transition-opacity duration-300 flex flex-col items-center justify-start w-full flex-1 h-full mt-0 md:pt-[10vh]">

        {/* Banner / Ad Section - Commented out as requested */}
        {/* <div className="w-full mx-auto max-w-2xl">
          <HermesBanner />
        </div> */}

        {/* Yield Panel - Main content */}
        <div className="w-full flex-1 flex flex-col pb-6 px-3 min-sm:px-1 md:px-8 3xl:px-20">
          <h1 className="text-3xl font-bold text-center mb-6">
            Discover the Best Yield Opportunities on Solana
          </h1>
          <p className="text-lg text-center mb-8 max-w-4xl mx-auto">
            Fully built and focused on Solana DeFi. Track real-time APYs across lending, staking, liquidity pools, and yield farming protocols to maximize your SOL and stablecoin returns.
          </p>
          <YieldPanel />
        </div>

      </div>
    </>
  );
}

/* Banner component kept for future use but currently not rendered */
// function HermesBanner() {
//   return (
//     <div className="w-full mx-auto max-w-2xl">
//       <div
//         className="
//           card-base
//           rounded-md border
//           bg-gradient-to-br from-primary/90 to-primary
//           p-5 md:p-6
//         "
//       >
//         <div className="flex items-center gap-4">
//           <div
//             className="
//               h-11 w-11 rounded-xl
//               bg-background/15
//               flex items-center justify-center
//               shrink-0
//             "
//           >
//             <Image
//               src="/brand/hermes.png"
//               alt="Hermes logo"
//               width={24}
//               height={24}
//               className="object-contain"
//               priority
//             />
//           </div>

//           <div className="flex flex-col">
//             <h2 className="text-sm md:text-base font-semibold text-primary-foreground">
//               Hermes Yield Explorer
//             </h2>

//             <p className="text-xs md:text-sm text-primary-foreground/75 leading-snug">
//               Aggregated APYs, protocols, and on-chain yield signals for top yield opportunities on Solana.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
