"use client"

import Image from "next/image"

const TOKEN_LIST_BASE = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet"

const PROTOCOLS = [
  { name: "Marinade", src: "https://docs.marinade.finance/~gitbook/image?url=https%3A%2F%2F2385969780-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FHvhBFBu5z7MIlkYpgMXs%252Fuploads%252F7kjf9qaB2prGWOT0C851%252FMarinade-black.jpg%3Falt%3Dmedia%26token%3D73212f16-8e8b-410a-862e-5dd6c2c5f80b&width=768&dpr=3&quality=100&sign=a98bd7c0&sv=2" },
  { name: "Jito", src: "https://www.jito.network/jito-black.svg" },
  { name: "Kamino", src: "https://kamino.com/assets/logo.1771604565.svg" },
  { name: "Solend", src: "https://solend.fi/assets/logo.dark.webp" },
  { name: "Orca", src: `${TOKEN_LIST_BASE}/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png` },
  { name: "Jupiter", src: `${TOKEN_LIST_BASE}/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN/logo.png` },
  { name: "Raydium", src: `${TOKEN_LIST_BASE}/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png` },
  { name: "Drift", src: "data:image/png;base64,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" },
]

function ProtocolLogo({ name, src }: { name: string; src: string }) {
  return (
    <>
      <div className="flex-shrink-0 flex items-center justify-center gap-2 px-6 sm:px-8 py-4">
        <Image
          src={src}
          alt={name}
          width={24}
          height={24}
          className="object-contain w-6 h-6 sm:w-7 sm:h-7"
          unoptimized
        />
        <span className="text-sm sm:text-base font-medium text-foreground/90 whitespace-nowrap">
          {name}
        </span>
      </div>
      <div className="flex-shrink-0 w-px h-10 sm:h-12 bg-border/60" aria-hidden />
    </>
  )
}

export function ProtocolMarquee() {
  const duplicated = [...PROTOCOLS, ...PROTOCOLS]

  return (
    <div className="overflow-hidden py-10 sm:py-12">
      <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-widest mb-8">
        Works with 10+ protocols
      </p>
      <div className="relative w-full">
        <div className="flex animate-protocol-marquee hover:[animation-play-state:paused] items-center">
          {duplicated.map((p, i) => (
            <ProtocolLogo key={`${p.name}-${i}`} name={p.name} src={p.src} />
          ))}
        </div>
      </div>
    </div>
  )
}
