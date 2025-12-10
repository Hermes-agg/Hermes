"use client";

import { useRef } from "react";
import { TrendingUp, TrendingDown, DollarSign, Percent, Activity, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Stat = {
  label: string;
  value: string;
  change?: number;
  changeText?: string;
  icon: React.ElementType;
};

const stats: Stat[] = [
  { label: "Solana DeFi TVL", value: "$8.42B", change: 4.2, icon: DollarSign },
  { label: "Avg Staking APY", value: "7.8%", change: -0.3, icon: Percent },
  { label: "Avg Lending APY", value: "5.2%", change: 1.1, icon: TrendingUp },
  { label: "Active Protocols", value: "127", change: 3, changeText: "new", icon: Activity },
  { label: "Unique Depositors", value: "892K", change: 8.5, icon: Users },
];

export function MarketStats() {
  const scrollRef = useRef<HTMLDivElement>(null);
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  const onMouseDown = (e: React.MouseEvent) => {
    isDown = true;
    startX = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft = scrollRef.current?.scrollLeft || 0;
  };

  const onMouseLeave = () => {
    isDown = false;
  };

  const onMouseUp = () => {
    isDown = false;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.2; // scroll speed
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      className="w-full overflow-x-auto scrollbar-hide px-3 backdrop-blur-sm cursor-grab active:cursor-grabbing select-none max-w-3xl"
    >
      <div className="flex gap-4 whitespace-nowrap min-w-max">
        {stats.map((stat, i) => {
          const isPositive = stat.change !== undefined && stat.change > 0;

          return (
            <div
              key={stat.label}
              className={cn(
                "flex items-center gap-3 py-2 px-4 card-base backdrop-blur-xl",
                "rounded-sm flex-shrink-0",
                "animate-in slide-in-from-right-12 fade-in duration-700 shadow-none"
              )}
              style={{
                animationDelay: `${i * 100 + 100}ms`,
                animationFillMode: "backwards",
              }}
            >
              <div className="flex items-center gap-2.5">
                <stat.icon className="w-4 h-4 text-primary/80 flex-shrink-0" />
                <span className="font-mono text-sm font-bold text-foreground">{stat.value}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-muted-foreground">{stat.label}</span>

                {stat.change !== undefined && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span
                      className={cn(
                        "flex items-center gap-0.5 font-medium",
                        isPositive ? "text-success" : "text-destructive"
                      )}
                    >
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(stat.change).toFixed(1)}%
                      {stat.changeText && (
                        <span className="text-muted-foreground/70 ml-0.5">{stat.changeText}</span>
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
