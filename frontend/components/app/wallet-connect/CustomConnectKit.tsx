"use client"
import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Wallet, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface Props {
  className?: string
  small?: boolean
}

export function CustomConnectButton({ className, small }: Props) {
  const { connected, publicKey, select, connect, disconnect, wallets } =
    useWallet()
  const [open, setOpen] = useState(false)

  const short = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey
      .toBase58()
      .slice(-4)}`
    : ""

  const handleSelectWallet = async (walletName: string) => {
    select(walletName as any)
    await connect()
    setOpen(false)
  }

  return (
    <div className="relative">
      <Button
        size={small ? "sm" : "default"}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 px-2 py-2 text-xs font-mono uppercase tracking-wider border rounded-sm",
          connected
            ? "bg-primary/10 text-primary border-primary/30"
            : "bg-secondary text-foreground border-border/50 hover:border-primary/50",
          className
        )}
      >
        <Wallet className="h-3.5 w-3.5" />
        {connected ? <span className="text-[10px]">{short}</span> : "Connect"}
      </Button>

      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 bg-card p-4 rounded-md shadow-xl flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              {connected ? "Wallet Connected" : "Connect Your Wallet"}
            </h2>

            {!connected && (
              <div className="flex flex-col gap-2">
                {wallets.map((wallet) => (
                  <div key={wallet.adapter.name} className="relative">
                    <Button
                      variant={"outline"}
                      className="w-full"
                      onClick={() => handleSelectWallet(wallet.adapter.name)}
                    >
                      Connect {wallet.adapter.name}
                    </Button>
                    {wallet.readyState === "Installed" && (
                      <Label className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Check className="h-3 w-3" />
                        Installed
                      </Label>
                    )}
                  </div>
                ))}
              </div>
            )}

            {connected && (
              <Button

                variant={"destructive"}
                className=""
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