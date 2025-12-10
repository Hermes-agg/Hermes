"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

const STATUE_IMAGES = [
  "/statues/statu_us-removebg-preview.png",
//   "/statues/16.png",
  "/statues/10-removebg-preview.png",
] as const;

const randomImage = () =>
  STATUE_IMAGES[Math.floor(Math.random() * STATUE_IMAGES.length)];

export default function BackgroundDecor() {
  const [currentStatue, setCurrentStatue] = useState<string>(randomImage());

  useEffect(() => {
    const connection: any = typeof navigator !== 'undefined' ? (navigator as any).connection : null;
    const isMetered = !!(connection?.saveData) || ["slow-2g", "2g"].includes(connection?.effectiveType);
    if (isMetered) {
      // On metered connections, avoid periodic image swaps to reduce data usage
      return;
    }

    const interval = setInterval(() => {
      setCurrentStatue(randomImage());
    }, 9000); // ~9 seconds – feels more natural

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden hidden sm:block">
      {/* SINGLE STATUE – BOTTOM RIGHT */}
      <div
        className="absolute"
        style={{
          right: "0%",
          bottom: "0%",
          width: "280px",
          height: "280px",
          transform: "translateY(38%) translateX(10%)", // hugs the corner perfectly
        }}
      >
        {/* This wrapper does ALL the magic */}
        <div
          key={currentStatue}
          className="relative w-full h-full animate-in fade-in zoom-in-95 duration-3000 ease-out"
          style={{
            maskImage: "radial-gradient(circle at bottom right, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(circle at bottom right, black 30%, transparent 80%)",
          }}
        >
          <Image
            src={currentStatue}
            alt="Liberty"
            fill
            sizes="280px"
            className="object-contain drop-shadow-2xl brightness-105 contrast-125 saturate-120 scale-110"
            priority={false}
            loading="lazy"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}