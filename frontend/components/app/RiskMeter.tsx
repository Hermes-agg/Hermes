import { cn } from "@/lib/utils";

type RiskProfile = "low" | "moderate" | "high";

interface RiskMeterProps {
  value: RiskProfile;
  onChange: (value: RiskProfile) => void;
}

const riskLevels: { value: RiskProfile; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-success" },
  { value: "moderate", label: "Mod", color: "bg-warning" },
  { value: "high", label: "High", color: "bg-destructive" },
];

export function RiskMeter({ value, onChange }: RiskMeterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
        Risk
      </span>
      <div className="flex items-center gap-0.5 bg-muted/50 p-0.5 rounded-sm">
        {riskLevels.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            className={cn(
              "px-2 py-0.5 font-mono text-[10px] transition-all rounded-sm",
              value === level.value
                ? cn(level.color, "text-background font-medium")
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}
