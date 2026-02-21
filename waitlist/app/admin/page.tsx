"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Users, Loader2, LogOut, ArrowLeft, Download } from "lucide-react"
import { useAppLogo } from "@/hooks/use-app-logo"

type WaitlistEntry = {
  id: string
  email: string
  alias: string
  created_at: string
}

export default function AdminPage() {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""))
  const [authenticated, setAuthenticated] = useState(false)
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const logoSrc = useAppLogo()

  const passcode = digits.join("")

  useEffect(() => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("admin_passcode") : null
    if (stored && stored.length === 6) {
      setDigits(stored.split(""))
      setLoading(true)
      fetchData(stored)
    }
  }, [])

  const fetchData = async (code: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/waitlist?passcode=${encodeURIComponent(code)}`)
      if (!res.ok) {
        if (res.status === 401) {
          setAuthenticated(false)
          sessionStorage.removeItem("admin_passcode")
          setError("Invalid passcode")
          setDigits(Array(6).fill(""))
        } else {
          setError("Failed to load data")
        }
        return
      }
      const data = await res.json()
      setEntries(data.entries ?? [])
      setTotal(data.total ?? 0)
      setAuthenticated(true)
      sessionStorage.setItem("admin_passcode", code)
    } catch {
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const chars = value.replace(/\D/g, "").slice(0, 6).split("")
      const next = [...digits]
      chars.forEach((c, i) => {
        if (index + i < 6) next[index + i] = c
      })
      setDigits(next)
      const focusIdx = Math.min(index + chars.length, 5)
      inputRefs.current[focusIdx]?.focus()
      return
    }
    const num = value.replace(/\D/g, "")
    if (num && !/^\d$/.test(num)) return
    const next = [...digits]
    next[index] = num
    setDigits(next)
    if (num && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode.length !== 6) return
    fetchData(passcode)
  }

  const handleLogout = () => {
    sessionStorage.removeItem("admin_passcode")
    setAuthenticated(false)
    setDigits(Array(6).fill(""))
    setEntries([])
    setTotal(0)
  }

  const exportCSV = () => {
    const headers = ["#", "Name / Alias", "Email", "Joined"]
    const rows = entries.map((e, i) => [
      i + 1,
      `"${e.alias.replace(/"/g, '""')}"`,
      e.email,
      new Date(e.created_at).toLocaleDateString(),
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hermes-waitlist-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!authenticated && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border border-border/40 bg-card/95 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
          <div className="flex justify-center mb-6">
            <Image src={logoSrc} alt="Hermes" width={100} height={40} className="h-10 w-auto object-contain" priority />
          </div>
          <p className="text-center text-muted-foreground mb-8 text-[15px] tracking-tight">
            Enter the 6-digit passcode to continue
          </p>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center gap-2.5">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="size-12 text-center text-xl font-semibold rounded-xl border border-input/80 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>
            {error && <p className="text-center text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={passcode.length !== 6}
              className="w-full h-14 rounded-2xl bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-[15px]"
            >
              Access Admin Panel
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Waitlist Dashboard</h1>
            <p className="text-muted-foreground">Hermes signups</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors text-sm font-medium"
              aria-label="Back to site"
            >
              <ArrowLeft className="size-4" />
              Back to site
            </a>
            <button
              onClick={handleLogout}
              className="size-9 flex items-center justify-center rounded-md border border-border/50 text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="rounded-xl border border-border/50 bg-card p-6 flex-1 max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Signups</p>
                    <p className="text-2xl font-bold text-foreground">{total}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={exportCSV}
                disabled={entries.length === 0}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border/50 bg-card text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                <Download className="size-4" />
                Export CSV
              </button>
            </div>

            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">#</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name / Alias</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-muted-foreground">No signups yet</td>
                      </tr>
                    ) : (
                      entries.map((entry, i) => (
                        <tr key={entry.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4 text-sm text-muted-foreground">{i + 1}</td>
                          <td className="py-3 px-4 text-sm font-medium text-foreground">{entry.alias}</td>
                          <td className="py-3 px-4 text-sm text-foreground">{entry.email}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
