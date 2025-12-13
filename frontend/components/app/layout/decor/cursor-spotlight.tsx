"use client"

import { useEffect, useRef } from "react"

interface CursorSpotlightProps {
  children: React.ReactNode
}

export function CursorSpotlight({ children }: CursorSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!ref.current) return
      const x = e.clientX
      const y = e.clientY
      ref.current.style.transform = `translate(${x - 40}px, ${y - 40}px)`
    }

    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [])

  return (
    <div className="relative h-full"> {/* This is now relative to main */}
      {/* Grid background - only covers this container */}
      <div
        className="pointer-events-none absolute inset-0 bg-grid"
        aria-hidden="true"

         style={{
      
          opacity: 0.02
        }}
      />

      {/* Spotlight mask */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden z-1  bg-grid"
        style={{
          maskImage: "radial-gradient(circle closest-side, black 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(circle closest-side, black 0%, transparent 100%)",
          opacity: 0.06,
        }}
      >
        {/* <div
          ref={ref}
          className="absolute left-0 top-0 w-40 h-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
          style={{ opacity: 0.2 }}
        /> */}
      </div>

      {/* Actual content on top */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  )
}