"use client"

import React from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export function ConnectWalletButton() {
  return (
    <div>
      <WalletMultiButton className="gap-2 bg-primary text-xs font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 glow-primary sm:text-sm" />
    </div>
  )
}
