import { TrendingUp, TrendingDown } from 'lucide-react';
import { MiniLineChart } from './MiniLineChart';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  chartData?: number[];
  chartColor?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
}

export function StatCard({
  label,
  value,
  change,
  chartData,
  chartColor = '#10b981',
  icon,
  trend
}: StatCardProps) {
  const hasPositiveChange = change !== undefined && change >= 0;

  return (
    <div className="card-base overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="card-body">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {icon && <div className="text-muted-foreground">{icon}</div>}
              <span className="text-caption text-muted-foreground">{label}</span>
            </div>
            <div className="text-mono text-2xl font-semibold tracking-tight">
              {value}
            </div>
          </div>
          {change !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium',
                hasPositiveChange
                  ? 'bg-green-500/10 text-green-600'
                  : 'bg-red-500/10 text-red-600'
              )}
            >
              {hasPositiveChange ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(change).toFixed(2)}%</span>
            </div>
          )}
        </div>

        {chartData && chartData.length > 0 && (
          <div className="mt-2 -mx-2 -mb-2">
            <MiniLineChart
              data={chartData}
              color={chartColor}
              height={50}
              showGradient={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
