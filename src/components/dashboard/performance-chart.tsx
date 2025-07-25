
'use client';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { PagePerformance } from '@/lib/types';
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { format } from 'date-fns';

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
};

interface PerformanceChartProps {
  data: PagePerformance[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  // Process data for charting
  const chartData = data
    .map((item) => ({
      date: new Date(item.lastUpdated),
      desktop: item.desktop['4g'].performanceScore,
      mobile: item.mobile['4g'].performanceScore,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Create a set of unique dates for the X-axis
  const uniqueDates = [...new Set(chartData.map(item => format(item.date, 'MMM d')))];

  // Aggregate data by date, averaging scores if multiple tests ran on the same day
  const aggregatedData = uniqueDates.map(dateStr => {
    const itemsOnDate = chartData.filter(item => format(item.date, 'MMM d') === dateStr);
    const avgMobile = itemsOnDate.reduce((acc, curr) => acc + curr.mobile, 0) / itemsOnDate.length;
    const avgDesktop = itemsOnDate.reduce((acc, curr) => acc + curr.desktop, 0) / itemsOnDate.length;
    return {
      name: dateStr,
      mobile: Math.round(avgMobile),
      desktop: Math.round(avgDesktop)
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={aggregatedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="mobile"
              type="monotone"
              stroke="var(--color-mobile)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="desktop"
              type="monotone"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
