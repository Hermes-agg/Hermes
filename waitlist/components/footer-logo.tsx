"use client"

import Image from "next/image"
import { useAppLogo } from "@/hooks/use-app-logo"

export function FooterLogo() {
  const logoSrc = useAppLogo()
  return (
    <Image
      alt="Hermes"
      src={logoSrc}
      width={72}
      height={28}
      className="h-6 w-auto object-contain opacity-90"
    />
  )
}
