"use client"

import { useState, useEffect } from "react"

export function useAppLogo() {
  const [logoSrc, setLogoSrc] = useState("/hermes-logo.png")

  useEffect(() => {
    const updateLogo = () => {
      const isDark = document.documentElement.classList.contains("dark")
      setLogoSrc(isDark ? "/hermes-dark-logo.png" : "/hermes-logo.png")
    }
    updateLogo()
    const observer = new MutationObserver(updateLogo)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  return logoSrc
}
