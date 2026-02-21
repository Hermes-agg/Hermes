"use client"

import { useTheme } from "next-themes"

export function useAppLogo() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  return isDark ? "/hermes-dark-logo.png" : "/hermes-logo.png"
}
