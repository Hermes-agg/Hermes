import { TrendingUp, TrendingDown } from 'lucide-react';
import { MiniLineChart } from './MiniLineChart';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  changeText?: string;
  chartData?: number[];
  chartColor?: string;
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  change,
  changeText,
  chartData,
  chartColor = 'hsl(var(--success))',
  icon,
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;

  return (
    <div className="card-base flex-shrink-0 w-[150px] sm:w-[170px]">
      <div className="p-3">
        {/* Top row: icon + value */}
        <div className="flex items-center gap-2 mb-1.5">
          {icon && (
            <div className="text-primary/80 [&>svg]:w-4 [&>svg]:h-4 flex-shrink-0">
              {icon}
            </div>
          )}
          <span className="text-mono text-sm font-bold text-foreground">
            {value}
          </span>
        </div>

        {/* Bottom row: label + change */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-muted-foreground truncate">{label}</span>

          {change !== undefined && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span
                className={cn(
                  'flex items-center gap-0.5 font-medium flex-shrink-0',
                  isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(change).toFixed(1)}%
                {changeText && (
                  <span className="text-muted-foreground/70 ml-0.5">{changeText}</span>
                )}
              </span>
            </>
          )}
        </div>

        {/* Optional chart */}
        {chartData && chartData.length > 0 && (
          <div className="mt-2 -mx-3 -mb-3">
            <MiniLineChart
              data={chartData}
              color={chartColor}
              height={32}
              showGradient={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
