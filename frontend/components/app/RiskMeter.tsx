import { cn } from "@/lib/utils";

type RiskProfile = "low" | "moderate" | "high";

interface RiskMeterProps {
  value: RiskProfile;
  onChange: (value: RiskProfile) => void;
}

const riskLevels: { value: RiskProfile; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "moderate", label: "Mod" },
  { value: "high", label: "High" },
];

export function RiskMeter({ value, onChange }: RiskMeterProps) {
  const getActiveIndex = () => {
    return riskLevels.findIndex((l) => l.value === value);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-label">Risk</span>
      <div className="flex items-center gap-0.5">
        {riskLevels.map((level, index) => {
          const activeIndex = getActiveIndex();
          const isActive = index <= activeIndex;
          const isSelected = level.value === value;

          return (
            <button
              key={level.value}
              onClick={() => onChange(level.value)}
              className={cn(
                "relative flex flex-col items-center transition-all duration-200",
                "focus:outline-none focus:ring-1 focus:ring-primary/50",

                "w-4.5"
              )}
              aria-label={`Set risk to ${level.label}`}
            >
              {/* Bar segment */}
              <div
                className={cn(
                  "risk-bar w-4.5",
                  isActive
                    ? level.value === "low"
                      ? "risk-low"
                      : level.value === "moderate"
                        ? "risk-moderate"
                        : "risk-high"
                    : "risk-inactive",
                  index === 0 && "rounded-l-sm",
                  index === riskLevels.length - 1 && "rounded-r-sm"
                )}
              />

              {/* Label (only visible when selected) */}
              <span
                className={cn(
                  "absolute -bottom-4 text-[8px] font-mono uppercase tracking-wide transition-opacity duration-200",
                  isSelected ? "opacity-100" : "opacity-30 text-muted-foreground",
                  isSelected && level.value === "low" && "text-success",
                  isSelected && level.value === "moderate" && "text-warning",
                  isSelected && level.value === "high" && "text-destructive"
                )}
              >
                {level.label}
              </span>

            </button>
          );
        })}
      </div>
    </div>
  );
}
