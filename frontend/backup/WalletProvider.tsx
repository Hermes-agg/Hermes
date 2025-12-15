"use client"

import { fetchSolBalance, fetchTokenAccounts } from '@/lib/solana'
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface TokenBalance {
  mint: string
  amount: number
  uiAmount: number
  decimals: number
}

export interface WalletState {
  connected: boolean
  address?: string
  providerName?: string
  solBalance?: number
  tokens?: TokenBalance[]
}

export interface WalletContextValue extends WalletState {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  refreshBalances: () => Promise<void>
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
  rpcUrl?: string
}

export function WalletProvider({ children, rpcUrl }: WalletProviderProps) {
  const [state, setState] = useState<WalletState>({ connected: false })
  const [rpc, setRpc] = useState<string>(rpcUrl || process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com')

  useEffect(() => {
    setRpc(rpcUrl || process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com')
  }, [rpcUrl])

  // listen for Phantom connect/disconnect
  useEffect(() => {
    const onConnect = (publicKey: any) => {
      setState((s) => ({ ...s, connected: true, address: publicKey?.toString() }))
    }
    const onDisconnect = () => {
      setState({ connected: false })
    }

    const provider = (window as any).solana
    if (provider && provider.isPhantom) {
      provider.on && provider.on('connect', onConnect)
      provider.on && provider.on('disconnect', onDisconnect)
    }

    return () => {
      if (provider && provider.isPhantom) {
        provider.removeListener && provider.removeListener('connect', onConnect)
        provider.removeListener && provider.removeListener('disconnect', onDisconnect)
      }
    }
  }, [])

  const connect = async () => {
    try {
      const provider = (window as any).solana
      if (!provider) throw new Error('No Solana provider found (install Phantom or another wallet)')
      const resp = await provider.connect()
      const address = resp?.publicKey?.toString() || provider.publicKey?.toString()
      setState((s) => ({ ...s, connected: true, address, providerName: provider?.name || 'phantom' }))
      // fetch balances after connect
      await refreshBalancesInternal(address)
    } catch (err) {
      console.error('wallet connect error', err)
      throw err
    }
  }

  const disconnect = async () => {
    try {
      const provider = (window as any).solana
      if (provider && provider.disconnect) {
        await provider.disconnect()
      }
    } catch (err) {
      console.warn('disconnect error', err)
    } finally {
      setState({ connected: false })
    }
  }

  const refreshBalancesInternal = async (address?: string) => {
    try {
      const addr = address || state.address
      if (!addr) return
      const sol = await fetchSolBalance(addr, rpc)
      const tokens = await fetchTokenAccounts(addr, rpc)
      setState((s) => ({ ...s, solBalance: sol, tokens }))
    } catch (err) {
      console.error('refresh balances error', err)
    }
  }

  const refreshBalances = async () => {
    await refreshBalancesInternal()
  }

  const value: WalletContextValue = {
    connected: state.connected,
    address: state.address,
    providerName: state.providerName,
    solBalance: state.solBalance,
    tokens: state.tokens || [],
    connect,
    disconnect,
    refreshBalances,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWalletContext() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWalletContext must be used within WalletProvider')
  return ctx
}
