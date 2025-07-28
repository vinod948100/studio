
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
import { useMemo } from 'react';

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

export function PerformanceChart({ data, dateRange }: PerformanceChartProps) {
  const { chartData, uniquePages, chartConfig } = useMemo(() => {
    // 1. Generate all days in the selected date range
    const allDaysInRange =
      dateRange && dateRange.from && dateRange.to
        ? eachDayOfInterval({
            start: startOfDay(dateRange.from),
            end: startOfDay(dateRange.to),
          })
        : [];

    // 2. Create a map of the data for quick lookups by date
    const dataMap = new Map<string, PagePerformance[]>();
    data.forEach((item) => {
      const day = format(new Date(item.lastUpdated), 'yyyy-MM-dd');
      const dayData = dataMap.get(day) || [];
      dayData.push(item);
      dataMap.set(day, dayData);
    });

    // 3. Get a list of unique pages
    const uniquePages = Array.from(
      new Map(data.map((item) => [item.reportPath, item])).values()
    );

    // 4. Create the final chart data
    const chartData = allDaysInRange.map((date) => {
      const dayKey = format(date, 'yyyy-MM-dd');
      const dayData = dataMap.get(dayKey) || [];
      const record: { name: string; [key: string]: any } = {
        name: format(date, 'MMM d'),
      };

      uniquePages.forEach((page) => {
        const pageDataForDay = dayData.find(
          (d) => d.reportPath === page.reportPath
        );
        const mobileKey = `${page.reportPath}-mobile`;
        const desktopKey = `${page.reportPath}-desktop`;

        if (pageDataForDay) {
          record[mobileKey] = pageDataForDay.mobile['4g'].performanceScore;
          record[desktopKey] = pageDataForDay.desktop['4g'].performanceScore;
        } else {
          // Use null to create gaps in the line for this specific page
          record[mobileKey] = null;
          record[desktopKey] = null;
        }
      });
      return record;
    });

    // 5. Create dynamic chart config for colors and labels
    const chartConfig: any = {};
    uniquePages.forEach((page) => {
      const color = stringToColor(page.reportPath);
      chartConfig[`${page.reportPath}-mobile`] = {
        label: `${page.reportPath} (Mobile)`,
        color: `hsl(${parseInt(color.substring(1, 3), 16) % 360}, 70%, 50%)`,
      };
      chartConfig[`${page.reportPath}-desktop`] = {
        label: `${page.reportPath} (Desktop)`,
        color: `hsl(${parseInt(color.substring(3, 5), 16) % 360}, 90%, 60%)`,
      };
    });

    return { chartData, uniquePages, chartConfig };
  }, [data, dateRange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trend</CardTitle>
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
              bottom: 60, // Increased bottom margin for legend
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
            <ChartLegend
              content={<ChartLegendContent verticalAlign="bottom" />}
            />
            {uniquePages.map((page) => [
              <Line
                key={`${page.reportPath}-mobile`}
                dataKey={`${page.reportPath}-mobile`}
                name={`${page.reportPath} (Mobile)`}
                type="monotone"
                stroke={chartConfig[`${page.reportPath}-mobile`]?.color}
                strokeWidth={2}
                dot={true}
                connectNulls={false} // Creates gaps for days without data
                strokeDasharray="5 5"
              />,
              <Line
                key={`${page.reportPath}-desktop`}
                dataKey={`${page.reportPath}-desktop`}
                name={`${page.reportPath} (Desktop)`}
                type="monotone"
                stroke={chartConfig[`${page.reportPath}-desktop`]?.color}
                strokeWidth={2}
                dot={true}
                connectNulls={false} // Creates gaps for days without data
              />,
            ])}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

