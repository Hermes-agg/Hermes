"use client"
import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CustomConnectButton() {
  const { connected, publicKey, connect, disconnect } = useWallet()
  const [open, setOpen] = useState(false)

  const short = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey
        .toBase58()
        .slice(-4)}`
    : ""

  return (
    <div className="relative">
      <Button onClick={() => setOpen((v) => !v)}>
        <Wallet className="h-4 w-4 mr-2" />
        {connected ? short : "Connect Wallet"}
      </Button>

      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 z-50 w-80 max-w-full -translate-x-1/2 -translate-y-1/2 bg-card p-4 rounded-md shadow-xl flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              {connected ? "Wallet Connected" : "Connect Your Wallet"}
            </h2>

            {!connected && (
              <div className="flex flex-col gap-2">
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={async () => {
                    await connect()
                    setOpen(false)
                  }}
                >
                  Connect Phantom
                </Button>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={async () => {
                    await connect()
                    setOpen(false)
                  }}
                >
                  Connect Solflare
                </Button>
              </div>
            )}

            {connected && (
              <Button
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  await disconnect()
                  setOpen(false)
                }}
              >
                Disconnect
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
