"use client"

import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
  small?: boolean
}

export function CustomConnectButton({ className, small }: Props) {
  const { publicKey, connected, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const [openMenu, setOpenMenu] = useState(false)

  const short = publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : ''

  const handleClick = () => {
    if (!connected) {
      // open the wallet modal provided by the adapter
      setVisible(true)
      return
    }

    // if connected, toggle a simple menu with Disconnect
    setOpenMenu((s) => !s)
  }

  return (
    <div className="relative">
      <Button size={small ? 'sm' : 'default'} onClick={handleClick}

        className={cn(
          "relative px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider rounded-lg",
          "bg-primary text-primary-foreground border border-primary/30",
          "hover:bg-primary/20 hover:border-primary/50 transition-all",
          "glow-gold",
          className
        )}
      >
        {/* Sharp corner accents */}
        {/* <div className="absolute top-0 left-0 w-1 h-1 border-t-2 border-l-2 border-primary/60" />
        <div className="absolute top-0 right-0 w-1 h-1 border-t-2 border-r-2 border-primary/60" />
        <div className="absolute bottom-0 left-0 w-1 h-1 border-b-2 border-l-2 border-primary/60" />
        <div className="absolute bottom-0 right-0 w-1 h-1 border-b-2 border-r-2 border-primary/60" /> */}


        {connected ? short : 'Connect'}
      </Button>

      {openMenu && connected && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(false)} />
          <div className="absolute right-0 mt-2 z-50 w-40 border border-border/50 bg-card shadow-xl">
            {/* Sharp corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary/50" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary/50" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary/50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary/50" />

            <button
              className="w-full px-3 py-2.5 font-mono text-xs text-foreground hover:bg-secondary hover:text-primary transition-colors text-left uppercase tracking-wider"
              onClick={async () => {
                setOpenMenu(false)
                try {
                  await disconnect()
                } catch (e) {
                  console.error('disconnect', e)
                }
              }}
            >
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  )
}



