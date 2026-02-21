"use client"

import Image from "next/image"

const PROTOCOLS = [
  { name: "Marinade", src: "/protocols/marinade-logo.png" },
  { name: "Jito", src: "/protocols/jito-logo.png" },
  { name: "Solana", src: "/protocols/solana-logo.png" },
  { name: "USDC", src: "/protocols/usdc-logo.png" },
  { name: "USDT", src: "/protocols/usdt-logo.png" },
  { name: "Solana", src: "/protocols/solanaLogoMark.svg" },
  { name: "USDC", src: "/protocols/usdcLogoMark.svg" },
  { name: "USDT", src: "/protocols/tetherLogoMark.svg" },
]

function ProtocolLogo({ name, src }: { name: string; src: string }) {
  const isSvg = src.endsWith(".svg")
  return (
    <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 mx-3 rounded-lg bg-card/80 border border-border/40 p-2.5">
      <Image
        src={src}
        alt={name}
        width={32}
        height={32}
        className="object-contain w-8 h-8"
        unoptimized={isSvg}
      />
    </div>
  )
}

export function ProtocolMarquee() {
  const duplicated = [...PROTOCOLS, ...PROTOCOLS]

  return (
    <div className="overflow-hidden py-8">
      <p className="text-center text-xs text-muted-foreground uppercase tracking-wider mb-6">
        Works across 10+ protocols
      </p>
      <div className="relative w-full">
        <div className="flex animate-marquee">
          {duplicated.map((p, i) => (
            <ProtocolLogo key={`${p.name}-${i}`} name={p.name} src={p.src} />
          ))}
        </div>
      </div>
    </div>
  )
}
