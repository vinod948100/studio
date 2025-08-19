'use client';
import { useMemo, useState } from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define TypeScript interfaces for type safety
interface MetricData {
  performanceScore?: number;
  fcp?: number;
  lcp?: number;
  tbt?: number;
  cls?: number;
}

interface NetworkPerformance {
  '4g'?: MetricData;
  fast3g?: MetricData;
}

interface PagePerformance {
  reportPath: string;
  lastUpdated: string | Date;
  mobile?: NetworkPerformance;
  desktop?: NetworkPerformance;
}

interface PerformanceChartProps {
  data: PagePerformance[];
  dateRange?: DateRange;
}

// Helper to generate a color from a string
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

// Process chart data
const processChartData = (data: PagePerformance[], dateRange?: DateRange, selectedPage?: string) => {
  const allDaysInRange =
    dateRange && dateRange.from && dateRange.to
      ? eachDayOfInterval({
          start: startOfDay(dateRange.from),
          end: startOfDay(dateRange.to),
        })
      : [];

  const pageDataToProcess =
    selectedPage && selectedPage !== 'all'
      ? data.filter((item) => item.reportPath === selectedPage)
      : data;

  const chartData: Record<string, any>[] = allDaysInRange.map((date) => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const record: { name: string; [key: string]: any } = {
      name: format(date, 'MMM d'),
    };

    const dataForDay = pageDataToProcess.filter(
      (d) => format(new Date(d.lastUpdated), 'yyyy-MM-dd') === dayKey
    );

    const metrics: (keyof MetricData)[] = ['performanceScore', 'fcp', 'lcp', 'tbt', 'cls'];
    const devices: ('mobile' | 'desktop')[] = ['mobile', 'desktop'];
    const networks: ('4g' | 'fast3g')[] = ['4g', 'fast3g'];

    devices.forEach((device) => {
      networks.forEach((network) => {
        metrics.forEach((metric) => {
          const key = `${device}-${network}-${metric}`;
          const relevantData = dataForDay
            .map((d) => d[device]?.[network]?.[metric])
            .filter((v): v is number => v !== undefined && v !== null);

          if (relevantData.length > 0) {
            const avg = relevantData.reduce((a, b) => a + b, 0) / relevantData.length;
            record[key] = metric === 'cls' ? parseFloat(avg.toFixed(4)) : Math.round(avg);
          } else {
            record[key] = null;
          }
        });
      });
    });

    return record;
  });

  const chartConfig: Record<string, { label: string; color: string }> = {};
  const metrics: (keyof MetricData)[] = ['performanceScore', 'fcp', 'lcp', 'tbt', 'cls'];
  const devices: ('mobile' | 'desktop')[] = ['mobile', 'desktop'];
  const networks: ('4g' | 'fast3g')[] = ['4g', 'fast3g'];

  devices.forEach((device) => {
    networks.forEach((network) => {
      metrics.forEach((metric) => {
        const key = `${device}-${network}-${metric}`;
        chartConfig[key] = {
          label: `${device.charAt(0).toUpperCase()}${device.slice(1)} ${network.toUpperCase()} ${metric.toUpperCase()}`,
          color: stringToColor(key),
        };
      });
    });
  });

  return { chartData, chartConfig };
};

// Define MetricConfig type
interface MetricConfig {
  label: string;
  unit: string;
  domain?: [number, number | 'auto'];
}

const METRIC_CONFIG: Record<keyof MetricData, MetricConfig> = {
  performanceScore: { label: 'Performance Score', unit: '', domain: [0, 100] },
  fcp: { label: 'First Contentful Paint', unit: 's' },
  lcp: { label: 'Largest Contentful Paint', unit: 's' },
  tbt: { label: 'Total Blocking Time', unit: 'ms' },
  cls: { label: 'Cumulative Layout Shift', unit: '' },
};

export function PerformanceChart({ data, dateRange }: PerformanceChartProps) {
  const uniquePagesList = useMemo(() => Array.from(new Set(data.map((item) => item.reportPath))), [data]);
  const [selectedPage, setSelectedPage] = useState<string>('all');

  const { chartData, chartConfig } = useMemo(
    () => processChartData(data, dateRange, selectedPage),
    [data, dateRange, selectedPage]
  );

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Select a page to view its performance trend over time.</CardDescription>
          <div className="mt-4 flex items-center gap-4">
            <Select onValueChange={setSelectedPage} value={selectedPage}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages (Average)</SelectItem>
                {uniquePagesList.map((page) => (
                  <SelectItem key={page} value={page}>
                    {page}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">No data available for the selected page and date range.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>
            Trend of performance attributes for {selectedPage === 'all' ? 'all pages (average)' : selectedPage}.
          </CardDescription>
          <div className="mt-4 flex items-center gap-4">
            <Select onValueChange={setSelectedPage} value={selectedPage}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages (Average)</SelectItem>
                {uniquePagesList.map((page) => (
                  <SelectItem key={page} value={page}>
                    {page}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {(Object.keys(METRIC_CONFIG) as (keyof typeof METRIC_CONFIG)[]).map((metric) => {
          const dataKeys = ['mobile-4g', 'mobile-fast3g', 'desktop-4g', 'desktop-fast3g'].map(
            (k) => `${k}-${metric}`
          );
          const hasData = chartData.some((dayData) =>
            dataKeys.some((key) => dayData[key] !== null && dayData[key] !== undefined)
          );

          if (!hasData) return null;

          return (
            <Card key={`${metric}-chart`}>
              <CardHeader>
                <CardTitle>{METRIC_CONFIG[metric].label} Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      accessibilityLayer
                      data={chartData}
                      margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis
                        domain={METRIC_CONFIG[metric].domain ?? [0, 'auto']}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      >
                        <Label
                          value={METRIC_CONFIG[metric].unit}
                          angle={-90}
                          position="insideLeft"
                          style={{ textAnchor: 'middle' }}
                        />
                      </YAxis>
                      <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent indicator="line" />} />
                      <Legend />
                      {dataKeys.map((key) => (
                        <Line
                          key={key}
                          dataKey={key}
                          name={chartConfig[key]?.label}
                          type="monotone"
                          stroke={chartConfig[key]?.color}
                          strokeWidth={2}
                          dot={true}
                          connectNulls={true}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}