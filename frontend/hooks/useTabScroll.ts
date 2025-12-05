"use client"

import { useEffect } from "react"

export function useTabScroll(tabKey: string, contentSelector: string) {
  useEffect(() => {
    let timeout: any

    function runScroll() {
      const header = document.querySelector("header")
      const content = document.querySelector(contentSelector)

      if (!content) return

      const headerHeight = header?.getBoundingClientRect().height ?? 0
      const saved = sessionStorage.getItem(`scroll-${tabKey}`)

      // If returning to tab → restore position
      if (saved) {
        window.scrollTo({
          top: Number(saved),
          behavior: "instant"
        })
        return
      }

      // If first time → scroll to section
      const contentTop = content.getBoundingClientRect().top + window.scrollY

      window.scrollTo({
        top: contentTop - headerHeight - 12, // extra safe padding
        behavior: "smooth"
      })
    }

    // DELAY until EVERYTHING is mounted (header included)
    timeout = setTimeout(runScroll, 120)

    const handleScroll = () => {
      sessionStorage.setItem(`scroll-${tabKey}`, String(window.scrollY))
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      clearTimeout(timeout)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [tabKey, contentSelector])
}
