import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';
import { MiniLineChart } from './MiniLineChart';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  labelShort: string;
  value: string;
  change?: number;
  changeText?: string;
  chartData?: number[];
  chartColor?: string;
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  labelShort,
  value,
  change,
  changeText,
  chartData,
  chartColor = 'hsl(var(--success))',
  icon,
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const hasChart = chartData && chartData.length > 0;

  return (
    <div className="card-base border border-border flex-shrink-0 w-[150px] sm:w-[170px] h-[75px] flex flex-col overflow-hidden">
      {/* Top Content Area */}
      <div className="px-3 pt-2 flex-1 flex flex-col justify-start">
        {/* Label - sits just above chart */}
        <h3 className="text-label truncate mb-1">
          {labelShort}
        </h3>


        <div className="flex items-center w-full gap-0.5 mb-1">
          <div className='flex items-center gap-0.5'>
            {/* {icon && (
            <div className="text-primary/80 [&>svg]:w-4 [&>svg]:h-4 flex-shrink-0">
              {icon}

            </div>
          )} */}
            <span className="text-mono truncate">
              {value}
            </span>
          </div>

          {change !== undefined && (
            <>
              <span
                className={cn(
                  'flex items-center gap-0.5 font-medium text-[10px] flex-shrink-0 whitespace-nowrap -mt-2',
                  isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {isPositive ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
                {Math.abs(change).toFixed(1)}%
                {changeText && <span className="text-muted-foreground/70 ml-0.5">{changeText}</span>}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Chart Area - dedicated space with proper height and no clipping */}
      <div className="w-full h-10 relative mx-auto"> 
        {hasChart ? (
          <div className="absolute inset-x-0 bottom-0 h-10"> 
            <MiniLineChart
              data={chartData}
              color={chartColor}
              height={40}
              showGradient={true}
            // className="w-full"
            />
          </div>
        ) : (
          <div className="h-10" />
        )}
      </div>
    </div>
  );
}