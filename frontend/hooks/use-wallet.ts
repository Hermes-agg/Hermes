"use client"

import { useWalletContext } from '@/components/app/providers/WalletProvider'

export function useWallet() {
  return useWalletContext()
}
