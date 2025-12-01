"use client"

import React, { ReactNode, useMemo } from 'react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider as AdapterWalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { clusterApiUrl } from '@solana/web3.js'

// Styles for wallet-adapter-react-ui modal
import '@solana/wallet-adapter-react-ui/styles.css'

interface Props {
  children: ReactNode
  network?: WalletAdapterNetwork | string
  rpcUrl?: string
}

export default function WalletAdapterProvider({ children, network = WalletAdapterNetwork.Mainnet, rpcUrl }: Props) {
  const endpoint = rpcUrl || process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(network as WalletAdapterNetwork)

  // Configure wallets
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network: network as WalletAdapterNetwork }),
    new BackpackWalletAdapter(),
  ], [network])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <AdapterWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </AdapterWalletProvider>
    </ConnectionProvider>
  )
}
