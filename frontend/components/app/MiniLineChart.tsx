import { useMemo } from 'react';

interface MiniLineChartProps {
  data: number[];
  color?: string;
  height?: number;
  showGradient?: boolean;
}

export function MiniLineChart({
  data,
  color = '#10b981',
  height = 60,
  showGradient = true
}: MiniLineChartProps) {
  const pathData = useMemo(() => {
    if (data.length < 2) return '';

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 100;
    const padding = 4;
    const availableHeight = height - padding * 2;
    const stepX = width / (data.length - 1);

    const points = data.map((value, index) => {
      const x = index * stepX;
      const normalizedValue = (value - min) / range;
      const y = height - (normalizedValue * availableHeight + padding);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  }, [data, height]);

  const areaPath = useMemo(() => {
    if (!showGradient || data.length < 2) return '';
    return `${pathData} L 100,${height} L 0,${height} Z`;
  }, [pathData, data.length, height, showGradient]);

  const gradientId = useMemo(() => `gradient-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      className="w-full"
      preserveAspectRatio="none"
      style={{ height: `${height}px` }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showGradient && (
        <path
          d={areaPath}
          fill={`url(#${gradientId})`}
        />
      )}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />
    </svg>
  );
}
