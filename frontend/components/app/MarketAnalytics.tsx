import { DollarSign, TrendingUp, PieChart, Zap } from 'lucide-react';
import { StatCard } from './StatCard';
import { useMemo } from 'react';

function generateMockChartData(baseValue: number, points: number = 24): number[] {
    return Array.from({ length: points }, (_, i) => {
        const trend = baseValue * (1 + i * 0.02);
        const noise = (Math.random() - 0.5) * baseValue * 0.1;
        return Math.max(0, trend + noise);
    });
}

export function MarketAnalytics() {
    const tvlData = useMemo(() => generateMockChartData(1200, 30), []);
    const apyData = useMemo(() => generateMockChartData(8, 30), []);
    const volumeData = useMemo(() => generateMockChartData(450, 30), []);

    const topProtocols = [
        { name: 'Marinade Finance', apy: 12.34, tvl: '$2.4B', color: '#3b82f6' },
        { name: 'Jito', apy: 11.89, tvl: '$1.8B', color: '#10b981' },
        { name: 'Kamino Finance', apy: 10.45, tvl: '$890M', color: '#f59e0b' },
        { name: 'Drift Protocol', apy: 9.23, tvl: '$650M', color: '#8b5cf6' },
        { name: 'Solend', apy: 8.76, tvl: '$420M', color: '#ec4899' },
    ];

    return (
        <div className="w-full overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none mx-auto"
        >
            <div className='mb-3'>
                <h1 className="text-label mb-1">Yield Market</h1> 

                <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary" />
                    <h2 className="text-caption capitalize">DeFi insights </h2>
                </div>
            </div>

            {/* <div className="min-w-0 flex flex-col items-end justify-end">
                        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                            Real-time insights into DeFi yield opportunities
                        </span>
                    </div> */}




            <div className="whitespace-nowrap">


                {/* Scrollable content */}
                <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex gap-4 pr-3 min-w-max">
                        <StatCard
                            label="Total Value Locked"
                            labelShort='TVL'
                            value="$8.2B"
                            change={5.23}
                            chartData={tvlData}
                            chartColor="#3b82f6"
                            icon={<DollarSign className="w-5 h-5" />}
                        />

                        <StatCard
                            label="Average APY"
                            labelShort='Average APY'
                            value="9.48%"
                            change={2.14}
                            chartData={apyData}
                            chartColor="#10b981"
                            icon={<TrendingUp className="w-5 h-5" />}
                        />

                        <StatCard
                            label="24h Volume"
                            labelShort='24h Volume'
                            value="$456M"
                            change={-1.28}
                            chartData={volumeData}
                            chartColor="#f59e0b"
                            icon={<Zap className="w-5 h-5" />}
                        />

                        <StatCard
                            label="Active Protocols"
                            labelShort='Active Protocols'
                            value="127"
                            change={8.5}
                            chartData={generateMockChartData(120, 30)}
                            chartColor="#8b5cf6"
                            icon={<PieChart className="w-5 h-5" />}
                        />


                        <StatCard
                            label="Active Protocols"
                            labelShort='Active Protocols'
                            value="127"
                            change={8.5}
                            chartData={generateMockChartData(120, 30)}
                            chartColor="#8b5cf6"
                            icon={<PieChart className="w-5 h-5" />}
                        />
                    </div>
                </div>

            </div>
        </div >

    );
}