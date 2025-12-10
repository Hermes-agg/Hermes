"use client"

import { useEffect, useRef } from "react"

export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!ref.current) return
      // Position the tracking element at cursor with center alignment
      ref.current.style.transform = `translate(${e.clientX - 40}px, ${e.clientY - 40}px)`
    }

    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [])

  return (
    <>
      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0 bg-grid"
        aria-hidden="true"
      />

      {/* Spotlight effect container */}
      <div
        className="pointer-events-none fixed inset-0 z-1 overflow-hidden bg-grid"
        style={{
          maskImage: "radial-gradient(circle closest-side, black 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(circle closest-side, black 0%, transparent 100%)",

           opacity: 0.06,
        }}
      />

      {/* Tracking indicator - separate from spotlight */}
      <div
        ref={ref}
        className="pointer-events-none fixed left-0 top-0 z-5 flex items-center justify-center rounded-full text-foreground text-xs font-medium px-3 py-1"
        style={{
          transform: "translate(-50%, -50%)", // Center the element on cursor
          opacity: 0.6,
        }}
        aria-hidden="true"
      >
        {/* + */}
      </div>
    </>
  )
}