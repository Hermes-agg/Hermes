"use client"

import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Button } from '@/components/ui/button'

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
      <Button size={small ? 'sm' : 'sm'} className={`gap-2 bg-primary text-tech text-xs font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 glow-primary ${className || ''}`} onClick={handleClick}>
        {connected ? short : 'Connect'}
      </Button>

      {openMenu && connected && (
        <div className="absolute z-99 right-0 mt-2 w-40 rounded-lg border border-border/50 bg-card p-2 shadow-lg">
          <button
            className="w-full px-2 py-2 text-sm text-foreground hover:bg-secondary rounded"
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
      )}
    </div>
  )
}
