
'use client';
import { useMemo } from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface PerformanceChartProps {
  data: PagePerformance[];
  dateRange?: DateRange;
}

// Helper to generate a color from a string.
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

// This is the core data processing logic.
const processChartData = (data: PagePerformance[], dateRange?: DateRange) => {
    // 1. Generate all days in the selected date range
    const allDaysInRange =
      dateRange && dateRange.from && dateRange.to
        ? eachDayOfInterval({
            start: startOfDay(dateRange.from),
            end: startOfDay(dateRange.to),
          })
        : [];

    // 2. Get a list of unique pages
    const uniquePages = Array.from(
      new Map(data.map((item) => [item.reportPath, item])).values()
    );

    // 3. Create the final chart data structure
    const chartData = allDaysInRange.map((date) => {
      const dayKey = format(date, 'yyyy-MM-dd');
      const record: { name: string; [key: string]: any } = {
        name: format(date, 'MMM d'),
      };
      
      // For each unique page, calculate its average score for the current day
      uniquePages.forEach(page => {
          const pageDataForDay = data.filter(d => d.reportPath === page.reportPath && format(new Date(d.lastUpdated), 'yyyy-MM-dd') === dayKey);
          
          const mobileKey = `${page.reportPath}-mobile`;
          const desktopKey = `${page.reportPath}-desktop`;

          if (pageDataForDay.length > 0) {
              // Average the scores if there are multiple tests for the same page on the same day
              const avgMobileScore = pageDataForDay.reduce((acc, curr) => acc + curr.mobile['4g'].performanceScore, 0) / pageDataForDay.length;
              const avgDesktopScore = pageDataForDay.reduce((acc, curr) => acc + curr.desktop['4g'].performanceScore, 0) / pageDataForDay.length;
              record[mobileKey] = Math.round(avgMobileScore);
              record[desktopKey] = Math.round(avgDesktopScore);
          } else {
              // Use null to create gaps in the line for this specific page on this day
              record[mobileKey] = null;
              record[desktopKey] = null;
          }
      });
      return record;
    });

    // 4. Create dynamic chart config for colors and labels
    const chartConfig: any = {};
    uniquePages.forEach((page) => {
      const color = stringToColor(page.reportPath);
      chartConfig[`${page.reportPath}-mobile`] = {
        label: page.reportPath,
        color: color,
      };
      chartConfig[`${page.reportPath}-desktop`] = {
        label: page.reportPath,
        color: color,
      };
    });

    return { chartData, uniquePages, chartConfig };
}


export function PerformanceChart({ data, dateRange }: PerformanceChartProps) {
  const { chartData, uniquePages, chartConfig } = useMemo(() => processChartData(data, dateRange), [data, dateRange]);

  if (!chartData || chartData.length === 0) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Performance Trend</CardTitle>
              </CardHeader>
              <CardContent className='h-96 flex items-center justify-center'>
                  <p className='text-muted-foreground'>No data available for the selected date range.</p>
              </CardContent>
          </Card>
      )
  }

  return (
    <div className='flex flex-col gap-6'>
        <div className='grid gap-6 md:grid-cols-1 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Mobile Performance Trend</CardTitle>
                <CardDescription>Average performance score for each page on mobile.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                  <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 20,
                      left: 10,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    >
                      <Label
                        value="Score"
                        angle={-90}
                        position="insideLeft"
                        style={{ textAnchor: 'middle' }}
                      />
                    </YAxis>
                    <ChartTooltip
                      cursor={{
                        strokeDasharray: '3 3',
                      }}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    {uniquePages.map((page) => (
                        <Line
                            key={`${page.reportPath}-mobile`}
                            dataKey={`${page.reportPath}-mobile`}
                            name={chartConfig[`${page.reportPath}-mobile`]?.label}
                            type="monotone"
                            stroke={chartConfig[`${page.reportPath}-mobile`]?.color}
                            strokeWidth={2}
                            dot={true}
                            connectNulls={true} 
                        />
                    ))}
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Desktop Performance Trend</CardTitle>
                <CardDescription>Average performance score for each page on desktop.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                  <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 20,
                      left: 10,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    >
                      <Label
                        value="Score"
                        angle={-90}
                        position="insideLeft"
                        style={{ textAnchor: 'middle' }}
                      />
                    </YAxis>
                    <ChartTooltip
                      cursor={{
                        strokeDasharray: '3 3',
                      }}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    {uniquePages.map((page) => (
                        <Line
                            key={`${page.reportPath}-desktop`}
                            dataKey={`${page.reportPath}-desktop`}
                            name={chartConfig[`${page.reportPath}-desktop`]?.label}
                            type="monotone"
                            stroke={chartConfig[`${page.reportPath}-desktop`]?.color}
                            strokeWidth={2}
                            dot={true}
                            connectNulls={true}
                        />
                    ))}
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Legend</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-x-6 gap-y-2">
                {uniquePages.map((page) => (
                    <div key={page.reportPath} className="flex items-center gap-2">
                        <div className="h-2 w-4 rounded-full" style={{ backgroundColor: chartConfig[`${page.reportPath}-mobile`]?.color }} />
                        <span className="text-sm text-muted-foreground">{page.reportPath}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
  );
}
