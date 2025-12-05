import { cn } from "@/lib/utils"

type RiskProfile = "low" | "moderate" | "high"

interface RiskMeterProps {
  value: RiskProfile
  onChange: (value: RiskProfile) => void
}

const riskLevels = [
  { value: "low" as const, label: "Low", color: "bg-emerald-500", activeGlow: "shadow-emerald-500/50" },
  { value: "moderate" as const, label: "Mod", color: "bg-amber-500", activeGlow: "shadow-amber-500/50" },
  { value: "high" as const, label: "High", color: "bg-red-500", activeGlow: "shadow-red-500/50" },
]

export function RiskMeter({ value, onChange }: RiskMeterProps) {
  const activeIndex = riskLevels.findIndex((l) => l.value === value)

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">Risk</span>
      
      <div className="flex items-center gap-0.5 p-1 bg-background/60 border border-border/40 rounded-sm">
        {riskLevels.map((level, index) => {
          const isActive = index <= activeIndex
          const isSelected = level.value === value
          
          return (
            <button
              key={level.value}
              onClick={() => onChange(level.value)}
              className={cn(
                "relative group flex flex-col items-center transition-all duration-200",
                "focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              )}
              title={level.label}
            >
              {/* Bar segment */}
              <div
                className={cn(
                  "w-4 h-2 transition-all duration-300",
                  isActive ? level.color : "bg-muted/30",
                  isActive && isSelected && `shadow-sm ${level.activeGlow}`,
                  index === 0 && "rounded-l-[2px]",
                  index === riskLevels.length - 1 && "rounded-r-[2px]"
                )}
              />
              
              {/* Label - only show on selected */}
              <span
                className={cn(
                  "absolute -bottom-3.5 font-mono text-[8px] uppercase tracking-wide transition-opacity duration-200",
                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60",
                  isSelected ? (
                    level.value === "low" ? "text-emerald-500" :
                    level.value === "moderate" ? "text-amber-500" : "text-red-500"
                  ) : "text-muted-foreground"
                )}
              >
                {level.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
