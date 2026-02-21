"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [alias, setAlias] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const isValidEmail = EMAIL_REGEX.test(email);
  const isValidAlias = alias.trim().length >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !alias.trim() || !isValidEmail || !isValidAlias) return;

    setIsSubmitting(true);
    setStatus("idle");
    setMessage("");

    try {
      const { error } = await supabase.from("waitlist").insert({
        email: email.trim().toLowerCase(),
        alias: alias.trim(),
      });

      if (error) {
        if (error.code === "23505") {
          setStatus("error");
          setMessage("You're already on the waitlist!");
        } else {
          setStatus("error");
          setMessage(error.message || "Something went wrong. Please try again.");
        }
        return;
      }

      setStatus("success");
      setMessage("You're in! We'll be in touch soon.");
      setEmail("");
      setAlias("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto space-y-4"
    >
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

      <div className="space-y-2">
        <label htmlFor="alias" className="text-body text-sm font-medium text-foreground block">
          Name / Alias
        </label>
        <Input
          id="alias"
          type="text"
          placeholder="How should we call you?"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          disabled={isSubmitting}
          required
          minLength={2}
          autoComplete="name"
          className={cn(
            "transition-all duration-200",
            alias && alias.trim().length > 0 && alias.trim().length < 2 && "border-destructive focus-visible:ring-destructive/20"
          )}
        />
        {alias && alias.trim().length > 0 && alias.trim().length < 2 && (
          <p className="text-xs text-destructive">Name must be at least 2 characters</p>
        )}
      </div>

      {/* Activity loader / status */}
      {isSubmitting && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Joining waitlist...</span>
        </div>
      )}

      {status === "success" && (
        <div className="flex items-center gap-2 text-success text-sm bg-success/10 border border-success/20 rounded-md px-3 py-2">
          <span>✓</span>
          <span>{message}</span>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          <span>✕</span>
          <span>{message}</span>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full h-11 text-sm font-medium"
        disabled={!email.trim() || !alias.trim() || !isValidEmail || !isValidAlias || isSubmitting}
        isLoading={isSubmitting}
      >
        {isSubmitting ? "Joining..." : "Join the waitlist"}
      </Button>
    </form>
  );
}
