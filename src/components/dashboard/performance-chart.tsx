
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
  Label,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';

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
  dateRange?: DateRange;
}

export function PerformanceChart({ data, dateRange }: PerformanceChartProps) {
  // 1. Create a map of the data for quick lookups by date
  const dataMap = new Map<
    string,
    { mobileScores: number[]; desktopScores: number[] }
  >();

  data.forEach((item) => {
    const day = format(new Date(item.lastUpdated), 'yyyy-MM-dd');
    if (!dataMap.has(day)) {
      dataMap.set(day, { mobileScores: [], desktopScores: [] });
    }
    dataMap
      .get(day)!
      .mobileScores.push(item.mobile['4g'].performanceScore);
    dataMap
      .get(day)!
      .desktopScores.push(item.desktop['4g'].performanceScore);
  });
  
  // 2. Generate all days in the selected date range
  const allDaysInRange =
    dateRange && dateRange.from && dateRange.to
      ? eachDayOfInterval({
          start: startOfDay(dateRange.from),
          end: startOfDay(dateRange.to),
        })
      : [];

  // 3. Create the final chart data, filling in gaps
  const aggregatedData = allDaysInRange.map((date) => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayData = dataMap.get(dayKey);

    if (dayData) {
      const avgMobile =
        dayData.mobileScores.reduce((acc, curr) => acc + curr, 0) /
        dayData.mobileScores.length;
      const avgDesktop =
        dayData.desktopScores.reduce((acc, curr) => acc + curr, 0) /
        dayData.desktopScores.length;
      return {
        name: format(date, 'MMM d'),
        mobile: Math.round(avgMobile),
        desktop: Math.round(avgDesktop),
      };
    } else {
      // For days with no data, return null to create gaps in the line chart
      return {
        name: format(date, 'MMM d'),
        mobile: null,
        desktop: null,
      };
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
              top: 5,
              right: 20,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              // tickFormatter={(value) => format(parseISO(value), 'MMM d')}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            >
               <Label value="Score" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
            </YAxis>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) =>
                    value === null ? 'N/A' : `${value}`
                  }
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="mobile"
              type="monotone"
              stroke="var(--color-mobile)"
              strokeWidth={2}
              dot={true}
              connectNulls={false} // This is crucial to create gaps
            />
            <Line
              dataKey="desktop"
              type="monotone"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={true}
              connectNulls={false} // This is crucial to create gaps
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
