"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { cn } from "@/lib/utils"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ALIAS_MAX = 10
const ALIAS_MIN = 2

export function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [alias, setAlias] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modal, setModal] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const isValidEmail = EMAIL_REGEX.test(email)
  const aliasVal = alias.trim()
  const isValidAlias = aliasVal.length >= ALIAS_MIN && aliasVal.length <= ALIAS_MAX

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !aliasVal || !isValidEmail || !isValidAlias) return

    setIsSubmitting(true)

    try {
      const { error } = await supabase.from("waitlist").insert({
        email: email.trim().toLowerCase(),
        alias: aliasVal,
      })

      if (error) {
        if (error.code === "23505") {
          setModal({ type: "error", message: "You're already on the waitlist!" })
        } else {
          setModal({ type: "error", message: error.message || "Something went wrong. Please try again." })
        }
        return
      }

      setModal({ type: "success", message: "You're in! We'll be in touch soon." })
      setEmail("")
      setAlias("")
    } catch {
      setModal({ type: "error", message: "Something went wrong. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-2">
          <label htmlFor="alias" className="text-body text-sm font-medium text-foreground block">
            Name / Alias
          </label>
          <Input
            id="alias"
            type="text"
            placeholder="How should we call you?"
            value={alias}
            onChange={(e) => setAlias(e.target.value.slice(0, ALIAS_MAX))}
            disabled={isSubmitting}
            required
            minLength={ALIAS_MIN}
            maxLength={ALIAS_MAX}
            autoComplete="nickname"
            className={cn(
              "transition-all duration-200",
              alias && (aliasVal.length < ALIAS_MIN || aliasVal.length > ALIAS_MAX) && "border-destructive focus-visible:ring-destructive/20"
            )}
          />
          <p className="text-xs text-muted-foreground">
            {aliasVal.length}/{ALIAS_MAX} characters
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-body text-sm font-medium text-foreground block">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
            autoComplete="email"
            className={cn(
              "transition-all duration-200",
              email && !isValidEmail && "border-destructive focus-visible:ring-destructive/20"
            )}
          />
          {email && !isValidEmail && (
            <p className="text-xs text-destructive">Please enter a valid email</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full h-11 text-sm font-medium"
          disabled={!email.trim() || !aliasVal || !isValidEmail || !isValidAlias || isSubmitting}
          isLoading={isSubmitting}
        >
          {isSubmitting ? "Joining..." : "Request Early Access →"}
        </Button>
      </form>

      <Modal open={!!modal} onOpenChange={(v) => !v && setModal(null)}>
        {modal?.type === "success" && (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="size-12 rounded-full bg-success/20 flex items-center justify-center">
              <span className="text-success text-2xl">✓</span>
            </div>
            <p className="text-body text-foreground text-center">{modal.message}</p>
          </div>
        )}
        {modal?.type === "error" && (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="size-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="text-destructive text-2xl">✕</span>
            </div>
            <p className="text-body text-foreground text-center">{modal.message}</p>
          </div>
        )}
      </Modal>
    </>
  )
}
