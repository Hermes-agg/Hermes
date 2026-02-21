"use client"

import Image from "next/image"

const TOKEN_LIST_BASE = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet"

const PROTOCOLS = [
  { name: "Solana", src: "/protocols/solanaLogoMark.svg" },
  { name: "Marinade", src: `${TOKEN_LIST_BASE}/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png` },
  { name: "Jito", src: `${TOKEN_LIST_BASE}/J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn/logo.png` },
  { name: "Kamino", src: `${TOKEN_LIST_BASE}/KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS/logo.png` },
  { name: "Solend", src: `${TOKEN_LIST_BASE}/SLNDpmoWTVADgEdndyvWzroNL7zSi1dF9PC3xHGtPwp/logo.png` },
  { name: "Orca", src: `${TOKEN_LIST_BASE}/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png` },
  { name: "Jupiter", src: `${TOKEN_LIST_BASE}/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN/logo.png` },
  { name: "USDC", src: "/protocols/usdcLogoMark.svg" },
  { name: "USDT", src: "/protocols/tetherLogoMark.svg" },
]

function ProtocolLogo({ name, src }: { name: string; src: string }) {
  const isSvg = src.endsWith(".svg")
  return (
    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mx-2 sm:mx-3 rounded-xl bg-card/80 dark:bg-card/60 border border-border/40 p-2.5 grayscale-[0.3] hover:grayscale-0 opacity-90 hover:opacity-100 transition-all duration-300">
      <Image
        src={src}
        alt={name}
        width={28}
        height={28}
        className="object-contain w-6 h-6 sm:w-7 sm:h-7"
        unoptimized={isSvg}
      />
    </div>
  )
}

export function ProtocolMarquee() {
  const duplicated = [...PROTOCOLS, ...PROTOCOLS]

  return (
    <div className="overflow-hidden py-8 sm:py-10">
      <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-6">
        Natively built on Solana
      </p>
      <p className="text-center text-sm sm:text-base text-foreground/90 mb-6 max-w-2xl mx-auto px-4">
        Hermes aggregates across Marinade, Jito, Kamino, Solend, Orca, Jupiter, and 10+ more.
      </p>
      <div className="relative w-full">
        <div className="flex animate-protocol-marquee hover:[animation-play-state:paused]">
          {duplicated.map((p, i) => (
            <ProtocolLogo key={`${p.name}-${i}`} name={p.name} src={p.src} />
          ))}
        </div>
      </div>
    </div>
  )
}
