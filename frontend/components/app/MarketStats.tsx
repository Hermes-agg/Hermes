"use client";

import { useRef, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "TVL", value: "$8.42B", change: 4.2, icon: DollarSign },
  { label: "Avg APY", value: "7.8%", change: -0.3, icon: Percent },
  { label: "Active Protocols", value: "127", change: 3, icon: Activity },
  { label: "TVL", value: "$8.42B", change: 4.2, icon: DollarSign },
  { label: "Avg APY", value: "7.8%", change: -0.3, icon: Percent },
  { label: "Active Protocols", value: "127", change: 3, icon: Activity },
];

export function MarketStats() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const autoScroll = useRef(true); // ✅ FIX: declare it
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const setWidth = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    // width of ONE full set
    setWidth.current = track.scrollWidth / 2;

    let rafId: number;

    const loop = () => {
      if (autoScroll.current && !isDragging.current) {
        container.scrollLeft += 0.6;
      }

      // 🔁 TRUE infinite seamless loop
      if (container.scrollLeft >= setWidth.current) {
        container.scrollLeft -= setWidth.current;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // 🖱 Drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    autoScroll.current = false;
    startX.current = e.pageX;
    scrollStart.current = containerRef.current?.scrollLeft || 0;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const walk = (e.pageX - startX.current) * 1.2;
    containerRef.current.scrollLeft = scrollStart.current - walk;
  };

  const stopDrag = () => {
    isDragging.current = false;
    autoScroll.current = true;
  };

  return (
    <section className="w-full px-3 min-sm:px-1 md:px-8 2xl:px-20 bg-primary/0.5 backdrop-blur-sm py-3">
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        className="w-full max-w-2xl overflow-x-hidden px-3 cursor-grab active:cursor-grabbing select-none"
      >
        <div ref={trackRef} className="flex gap-4 min-w-max">
          {/* ORIGINAL SET */}
          {stats.map((stat, i) => (
            <StatCard key={`a-${i}`} stat={stat} />
          ))}

          {/* CLONE SET */}
          {stats.map((stat, i) => (
            <StatCard key={`b-${i}`} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat }: { stat: any }) {
  const positive = stat.change > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-sm flex-shrink-0",
        "card-base backdrop-blur-xl"
      )}
    >
      <span className="font-mono text-sm font-bold">{stat.value}</span>

      <div className="flex items-center gap-1 text-[10px]">
        <span className="text-muted-foreground">{stat.label}</span>
        <span className="text-muted-foreground/40">•</span>

        <span
          className={cn(
            "flex items-center gap-0.5 font-medium",
            positive ? "text-success" : "text-destructive"
          )}
        >
          {positive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {Math.abs(stat.change).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
